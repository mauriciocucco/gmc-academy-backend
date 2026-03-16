import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '../../../../common/domain/enums/user-role.enum';
import { Roles } from '../../../../common/infrastructure/http/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../../common/infrastructure/http/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/infrastructure/http/guards/roles.guard';
import {
  ListAdminMaterialsQueryDto,
  ListAdminMaterialsResponseDto,
} from '../../application/dto/list-admin-materials.dto';
import { ListAdminMaterialsUseCase } from '../../application/use-cases/list-admin-materials.use-case';

@ApiTags('Admin')
@ApiBearerAuth('access-token')
@Controller({ path: 'admin/materials', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminMaterialsController {
  constructor(
    private readonly listAdminMaterialsUseCase: ListAdminMaterialsUseCase,
  ) {}

  @ApiOperation({ summary: 'List materials with pagination and filters (Admin only)' })
  @ApiResponse({ status: 200, type: ListAdminMaterialsResponseDto })
  @Get()
  async list(
    @Query() query: ListAdminMaterialsQueryDto,
  ): Promise<ListAdminMaterialsResponseDto> {
    return this.listAdminMaterialsUseCase.execute({
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 10,
      search: query.search,
      categoryId: query.categoryId,
      publishedStatus: query.publishedStatus ?? 'all',
    });
  }
}
