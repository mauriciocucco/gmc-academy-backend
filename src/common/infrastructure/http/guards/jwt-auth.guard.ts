import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../../../modules/users/domain/ports/user-repository.port';
import {
  isUserBlocked,
  USER_ACCESS_BLOCKED_MESSAGE,
} from '../../../../modules/users/domain/user-access';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
      user?: JwtPayload;
    }>();
    const token = this.extractTokenFromHeader(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException('Missing access token');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      });
      const user = await this.userRepository.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Invalid access token');
      }
      if (isUserBlocked(user)) {
        throw new ForbiddenException(USER_ACCESS_BLOCKED_MESSAGE);
      }
      request.user = payload;
      return true;
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new UnauthorizedException('Invalid access token');
    }
  }

  private extractTokenFromHeader(authorization?: string): string | null {
    if (!authorization) {
      return null;
    }

    const [type, token] = authorization.split(' ');
    if (type !== 'Bearer' || !token) {
      return null;
    }

    return token;
  }
}
