import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RefreshSessionUseCase } from '../../application/use-cases/refresh-session.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { LoginDto } from '../../application/dto/login.dto';
import { RefreshTokenDto } from '../../application/dto/refresh-token.dto';
import { AuthSessionDto } from '../../application/dto/auth-session.dto';
import { JwtAuthGuard } from '../../../../common/infrastructure/http/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/infrastructure/http/decorators/current-user.decorator';
import { JwtPayload } from '../../../../common/infrastructure/http/interfaces/jwt-payload.interface';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshSessionUseCase: RefreshSessionUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, type: AuthSessionDto })
  @Post('login')
  @HttpCode(200)
  async login(@Body() body: LoginDto): Promise<AuthSessionDto> {
    return this.loginUseCase.execute(body);
  }

  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: 200, type: AuthSessionDto })
  @Post('refresh')
  @HttpCode(200)
  async refresh(@Body() body: RefreshTokenDto): Promise<AuthSessionDto> {
    return this.refreshSessionUseCase.execute(body);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Logout current session' })
  @ApiResponse({ status: 204 })
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async logout(@CurrentUser() user: JwtPayload): Promise<void> {
    await this.logoutUseCase.execute(user.sub);
  }
}
