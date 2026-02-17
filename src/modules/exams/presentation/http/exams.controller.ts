import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/infrastructure/http/guards/jwt-auth.guard';
import { GetActiveExamUseCase } from '../../application/use-cases/get-active-exam.use-case';
import { ActiveExamResponseDto } from '../../application/dto/active-exam-response.dto';
import { SubmitExamUseCase } from '../../application/use-cases/submit-exam.use-case';
import { SubmitExamDto } from '../../application/dto/submit-exam.dto';
import { SubmitExamResponseDto } from '../../application/dto/submit-exam-response.dto';
import { CurrentUser } from '../../../../common/infrastructure/http/decorators/current-user.decorator';
import { JwtPayload } from '../../../../common/infrastructure/http/interfaces/jwt-payload.interface';
import { RolesGuard } from '../../../../common/infrastructure/http/guards/roles.guard';
import { Roles } from '../../../../common/infrastructure/http/decorators/roles.decorator';
import { UserRole } from '../../../../common/domain/enums/user-role.enum';

@Controller({ path: 'exams', version: '1' })
@UseGuards(JwtAuthGuard)
export class ExamsController {
  constructor(
    private readonly getActiveExamUseCase: GetActiveExamUseCase,
    private readonly submitExamUseCase: SubmitExamUseCase,
  ) {}

  @Get('active')
  async active(): Promise<ActiveExamResponseDto> {
    return this.getActiveExamUseCase.execute();
  }

  @Post(':id/submit')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  async submit(
    @Param('id') examId: string,
    @Body() body: SubmitExamDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<SubmitExamResponseDto> {
    return this.submitExamUseCase.execute(examId, user.sub, body);
  }
}
