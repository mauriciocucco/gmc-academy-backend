import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import {
  TOKEN_SERVICE,
  TokenServicePort,
} from '../../domain/ports/token-service.port';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../../users/domain/ports/user-repository.port';
import {
  PASSWORD_HASHER,
  PasswordHasherPort,
} from '../../domain/ports/password-hasher.port';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { AuthSessionDto } from '../dto/auth-session.dto';

@Injectable()
export class RefreshSessionUseCase {
  constructor(
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenServicePort,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasherPort,
  ) {}

  async execute(dto: RefreshTokenDto): Promise<AuthSessionDto> {
    const payload = await this.tokenService.verifyRefreshToken(
      dto.refreshToken,
    );
    const user = await this.userRepository.findById(payload.sub);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh session');
    }

    const isValid = await this.passwordHasher.compare(
      dto.refreshToken,
      user.refreshTokenHash,
    );
    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh session');
    }

    const accessTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken =
      await this.tokenService.signAccessToken(accessTokenPayload);
    const refreshToken =
      await this.tokenService.signRefreshToken(accessTokenPayload);
    const refreshTokenHash = await this.passwordHasher.hash(refreshToken);
    await this.userRepository.saveRefreshTokenHash(user.id, refreshTokenHash);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }
}
