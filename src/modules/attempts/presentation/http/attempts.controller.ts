import { Controller, Get, UseGuards } from '@nestjs/common';
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

@Controller({ path: 'attempts', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT)
export class AttemptsController {
  constructor(private readonly listMyAttemptsUseCase: ListMyAttemptsUseCase) {}

  @Get('me')
  async mine(@CurrentUser() user: JwtPayload): Promise<AttemptResponseDto[]> {
    return this.listMyAttemptsUseCase.execute(user.sub);
  }
}
