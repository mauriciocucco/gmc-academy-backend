import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
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
import { ListExamsUseCase } from '../../application/use-cases/list-exams.use-case';
import {
  ExamDetailResponseDto,
  ExamSummaryResponseDto,
} from '../../application/dto/exam-response.dto';
import { GetExamDetailUseCase } from '../../application/use-cases/get-exam-detail.use-case';
import { CreateExamUseCase } from '../../application/use-cases/create-exam.use-case';
import { UpdateExamUseCase } from '../../application/use-cases/update-exam.use-case';
import { DeleteExamUseCase } from '../../application/use-cases/delete-exam.use-case';
import {
  CreateExamDto,
  UpdateExamDto,
} from '../../application/dto/manage-exam.dto';

@Controller({ path: 'exams', version: '1' })
@UseGuards(JwtAuthGuard)
export class ExamsController {
  constructor(
    private readonly getActiveExamUseCase: GetActiveExamUseCase,
    private readonly listExamsUseCase: ListExamsUseCase,
    private readonly getExamDetailUseCase: GetExamDetailUseCase,
    private readonly createExamUseCase: CreateExamUseCase,
    private readonly updateExamUseCase: UpdateExamUseCase,
    private readonly deleteExamUseCase: DeleteExamUseCase,
    private readonly submitExamUseCase: SubmitExamUseCase,
  ) {}

  @Get()
  async list(
    @CurrentUser() user: JwtPayload,
  ): Promise<ExamSummaryResponseDto[]> {
    return this.listExamsUseCase.execute(user.role);
  }

  @Get('active')
  async active(): Promise<ActiveExamResponseDto> {
    return this.getActiveExamUseCase.execute();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async detail(@Param('id') examId: string): Promise<ExamDetailResponseDto> {
    return this.getExamDetailUseCase.execute(examId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() body: CreateExamDto): Promise<ExamDetailResponseDto> {
    return this.createExamUseCase.execute(body);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') examId: string,
    @Body() body: UpdateExamDto,
  ): Promise<ExamDetailResponseDto> {
    return this.updateExamUseCase.execute(examId, body);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(204)
  async remove(@Param('id') examId: string): Promise<void> {
    await this.deleteExamUseCase.execute(examId);
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
