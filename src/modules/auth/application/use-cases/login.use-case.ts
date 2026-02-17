import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../../users/domain/ports/user-repository.port';
import {
  PASSWORD_HASHER,
  PasswordHasherPort,
} from '../../domain/ports/password-hasher.port';
import {
  TOKEN_SERVICE,
  TokenServicePort,
} from '../../domain/ports/token-service.port';
import { LoginDto } from '../dto/login.dto';
import { AuthSessionDto } from '../dto/auth-session.dto';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasherPort,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenServicePort,
  ) {}

  async execute(dto: LoginDto): Promise<AuthSessionDto> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValidPassword = await this.passwordHasher.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
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
