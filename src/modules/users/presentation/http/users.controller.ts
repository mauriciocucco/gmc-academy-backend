import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GetMeUseCase } from '../../application/use-cases/get-me.use-case';
import { GetMyProgressUseCase } from '../../application/use-cases/get-my-progress.use-case';
import { JwtAuthGuard } from '../../../../common/infrastructure/http/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/infrastructure/http/guards/roles.guard';
import { Roles } from '../../../../common/infrastructure/http/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/infrastructure/http/decorators/current-user.decorator';
import { JwtPayload } from '../../../../common/infrastructure/http/interfaces/jwt-payload.interface';
import { UserResponseDto } from '../../application/dto/user-response.dto';
import { StudentProgressResponseDto } from '../../application/dto/student-progress-response.dto';
import { UserRole } from '../../../../common/domain/enums/user-role.enum';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller({ path: '', version: '1' })
export class UsersController {
  constructor(
    private readonly getMeUseCase: GetMeUseCase,
    private readonly getMyProgressUseCase: GetMyProgressUseCase,
  ) {}

  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: JwtPayload): Promise<UserResponseDto> {
    return this.getMeUseCase.execute(user.sub);
  }

  @ApiOperation({ summary: 'Get current student progress summary' })
  @ApiResponse({ status: 200, type: StudentProgressResponseDto })
  @Get('me/progress')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  async progress(
    @CurrentUser() user: JwtPayload,
  ): Promise<StudentProgressResponseDto> {
    return this.getMyProgressUseCase.execute(user.sub);
  }
}
