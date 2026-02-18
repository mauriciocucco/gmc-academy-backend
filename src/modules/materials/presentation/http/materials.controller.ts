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
import { RolesGuard } from '../../../../common/infrastructure/http/guards/roles.guard';
import { Roles } from '../../../../common/infrastructure/http/decorators/roles.decorator';
import { UserRole } from '../../../../common/domain/enums/user-role.enum';
import { CurrentUser } from '../../../../common/infrastructure/http/decorators/current-user.decorator';
import { JwtPayload } from '../../../../common/infrastructure/http/interfaces/jwt-payload.interface';
import { ListMaterialsUseCase } from '../../application/use-cases/list-materials.use-case';
import {
  MaterialCategoryResponseDto,
  MaterialResponseDto,
} from '../../application/dto/material-response.dto';
import { CreateMaterialUseCase } from '../../application/use-cases/create-material.use-case';
import { UpdateMaterialUseCase } from '../../application/use-cases/update-material.use-case';
import { DeleteMaterialUseCase } from '../../application/use-cases/delete-material.use-case';
import { CreateMaterialDto } from '../../application/dto/create-material.dto';
import { UpdateMaterialDto } from '../../application/dto/update-material.dto';
import { ListMaterialCategoriesUseCase } from '../../application/use-cases/list-material-categories.use-case';
import { CreateMaterialCategoryDto } from '../../application/dto/create-material-category.dto';
import { CreateMaterialCategoryUseCase } from '../../application/use-cases/create-material-category.use-case';
import { SetStudentMaterialAccessDto } from '../../application/dto/set-student-material-access.dto';
import { SetStudentMaterialAccessUseCase } from '../../application/use-cases/set-student-material-access.use-case';

@Controller({ path: 'materials', version: '1' })
@UseGuards(JwtAuthGuard)
export class MaterialsController {
  constructor(
    private readonly listMaterialsUseCase: ListMaterialsUseCase,
    private readonly listMaterialCategoriesUseCase: ListMaterialCategoriesUseCase,
    private readonly createMaterialUseCase: CreateMaterialUseCase,
    private readonly createMaterialCategoryUseCase: CreateMaterialCategoryUseCase,
    private readonly updateMaterialUseCase: UpdateMaterialUseCase,
    private readonly deleteMaterialUseCase: DeleteMaterialUseCase,
    private readonly setStudentMaterialAccessUseCase: SetStudentMaterialAccessUseCase,
  ) {}

  @Get()
  async list(@CurrentUser() user: JwtPayload): Promise<MaterialResponseDto[]> {
    return this.listMaterialsUseCase.execute({
      role: user.role,
      userId: user.sub,
    });
  }

  @Get('categories')
  async categories(): Promise<MaterialCategoryResponseDto[]> {
    return this.listMaterialCategoriesUseCase.execute();
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(
    @Body() body: CreateMaterialDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<MaterialResponseDto> {
    return this.createMaterialUseCase.execute(body, user.sub);
  }

  @Post('categories')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async createCategory(
    @Body() body: CreateMaterialCategoryDto,
  ): Promise<MaterialCategoryResponseDto> {
    return this.createMaterialCategoryUseCase.execute(body);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() body: UpdateMaterialDto,
  ): Promise<MaterialResponseDto> {
    return this.updateMaterialUseCase.execute(id, body);
  }

  @Patch(':id/access/:studentId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(204)
  async setStudentAccess(
    @Param('id') materialId: string,
    @Param('studentId') studentId: string,
    @Body() body: SetStudentMaterialAccessDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    await this.setStudentMaterialAccessUseCase.execute({
      materialId,
      studentId,
      enabledById: user.sub,
      dto: body,
    });
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(204)
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteMaterialUseCase.execute(id);
  }
}
