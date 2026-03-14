import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/infrastructure/http/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/infrastructure/http/guards/roles.guard';
import { Roles } from '../../../../common/infrastructure/http/decorators/roles.decorator';
import { UserRole } from '../../../../common/domain/enums/user-role.enum';
import { CurrentUser } from '../../../../common/infrastructure/http/decorators/current-user.decorator';
import { JwtPayload } from '../../../../common/infrastructure/http/interfaces/jwt-payload.interface';
import { ListMyAttemptsUseCase } from '../../application/use-cases/list-my-attempts.use-case';
import { GetMyAttemptDetailUseCase } from '../../application/use-cases/get-my-attempt-detail.use-case';
import {
  AttemptDetailResponseDto,
  AttemptResponseDto,
} from '../../application/dto/attempt-response.dto';

@ApiTags('Attempts')
@ApiBearerAuth('access-token')
@Controller({ path: 'attempts', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT)
export class AttemptsController {
  constructor(
    private readonly listMyAttemptsUseCase: ListMyAttemptsUseCase,
    private readonly getMyAttemptDetailUseCase: GetMyAttemptDetailUseCase,
  ) {}

  @ApiOperation({ summary: 'List current student exam attempts' })
  @ApiResponse({ status: 200, type: [AttemptResponseDto] })
  @Get('me')
  async mine(@CurrentUser() user: JwtPayload): Promise<AttemptResponseDto[]> {
    return this.listMyAttemptsUseCase.execute(user.sub);
  }

  @ApiOperation({ summary: 'Get current student attempt detail' })
  @ApiParam({ name: 'id', description: 'Attempt ID' })
  @ApiResponse({ status: 200, type: AttemptDetailResponseDto })
  @ApiResponse({ status: 404, description: 'Attempt not found' })
  @Get('me/:id')
  async detail(
    @CurrentUser() user: JwtPayload,
    @Param('id') attemptId: string,
  ): Promise<AttemptDetailResponseDto> {
    return this.getMyAttemptDetailUseCase.execute(user.sub, attemptId);
  }
}
