import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '../../../../common/domain/enums/user-role.enum';
import { Roles } from '../../../../common/infrastructure/http/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/infrastructure/http/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../../common/infrastructure/http/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/infrastructure/http/guards/roles.guard';
import { JwtPayload } from '../../../../common/infrastructure/http/interfaces/jwt-payload.interface';
import {
  AdminExamConfigResponseDto,
  UpdateAdminExamConfigDto,
} from '../../application/dto/admin-exam-config.dto';
import { GetAdminExamConfigUseCase } from '../../application/use-cases/get-admin-exam-config.use-case';
import { UpdateAdminExamConfigUseCase } from '../../application/use-cases/update-admin-exam-config.use-case';

@ApiTags('Admin')
@ApiBearerAuth('access-token')
@Controller({ path: 'admin/exam', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminExamController {
  constructor(
    private readonly getAdminExamConfigUseCase: GetAdminExamConfigUseCase,
    private readonly updateAdminExamConfigUseCase: UpdateAdminExamConfigUseCase,
  ) {}

  @ApiOperation({ summary: 'Get active exam configuration (Admin only)' })
  @ApiResponse({ status: 200, type: AdminExamConfigResponseDto })
  @Get()
  async getConfig(): Promise<AdminExamConfigResponseDto> {
    return this.getAdminExamConfigUseCase.execute();
  }

  @ApiOperation({
    summary: 'Create or update the active exam configuration (Admin only)',
  })
  @ApiResponse({ status: 200, type: AdminExamConfigResponseDto })
  @Patch()
  async updateConfig(
    @Body() body: UpdateAdminExamConfigDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<AdminExamConfigResponseDto> {
    return this.updateAdminExamConfigUseCase.execute(user.sub, body);
  }
}
