import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GetMeUseCase } from '../../application/use-cases/get-me.use-case';
import { JwtAuthGuard } from '../../../../common/infrastructure/http/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/infrastructure/http/decorators/current-user.decorator';
import { JwtPayload } from '../../../../common/infrastructure/http/interfaces/jwt-payload.interface';
import { UserResponseDto } from '../../application/dto/user-response.dto';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller({ path: '', version: '1' })
export class UsersController {
  constructor(private readonly getMeUseCase: GetMeUseCase) {}

  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: JwtPayload): Promise<UserResponseDto> {
    return this.getMeUseCase.execute(user.sub);
  }
}
