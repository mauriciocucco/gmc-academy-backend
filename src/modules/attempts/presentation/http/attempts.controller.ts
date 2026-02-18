import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/infrastructure/http/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/infrastructure/http/guards/roles.guard';
import { Roles } from '../../../../common/infrastructure/http/decorators/roles.decorator';
import { UserRole } from '../../../../common/domain/enums/user-role.enum';
import { CurrentUser } from '../../../../common/infrastructure/http/decorators/current-user.decorator';
import { JwtPayload } from '../../../../common/infrastructure/http/interfaces/jwt-payload.interface';
import {
  AttemptResponseDto,
  ListMyAttemptsUseCase,
} from '../../application/use-cases/list-my-attempts.use-case';

@ApiTags('Attempts')
@ApiBearerAuth('access-token')
@Controller({ path: 'attempts', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT)
export class AttemptsController {
  constructor(private readonly listMyAttemptsUseCase: ListMyAttemptsUseCase) {}

  @ApiOperation({ summary: 'List current student exam attempts' })
  @ApiResponse({
    status: 200,
    description: 'Array of exam attempts',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          examId: { type: 'string' },
          examTitle: { type: 'string' },
          score: { type: 'number' },
          passed: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @Get('me')
  async mine(@CurrentUser() user: JwtPayload): Promise<AttemptResponseDto[]> {
    return this.listMyAttemptsUseCase.execute(user.sub);
  }
}
