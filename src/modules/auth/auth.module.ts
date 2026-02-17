import { Module } from '@nestjs/common';
import { AuthController } from './presentation/http/auth.controller';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RefreshSessionUseCase } from './application/use-cases/refresh-session.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { UsersModule } from '../users/users.module';
import { PASSWORD_HASHER } from './domain/ports/password-hasher.port';
import { BcryptPasswordHasherAdapter } from './infrastructure/security/bcrypt-password-hasher.adapter';
import { TOKEN_SERVICE } from './domain/ports/token-service.port';
import { JwtTokenServiceAdapter } from './infrastructure/security/jwt-token-service.adapter';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    RefreshSessionUseCase,
    LogoutUseCase,
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptPasswordHasherAdapter,
    },
    {
      provide: TOKEN_SERVICE,
      useClass: JwtTokenServiceAdapter,
    },
  ],
  exports: [PASSWORD_HASHER, TOKEN_SERVICE],
})
export class AuthModule {}
