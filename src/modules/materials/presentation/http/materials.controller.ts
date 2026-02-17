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
import { MaterialResponseDto } from '../../application/dto/material-response.dto';
import { CreateMaterialUseCase } from '../../application/use-cases/create-material.use-case';
import { UpdateMaterialUseCase } from '../../application/use-cases/update-material.use-case';
import { DeleteMaterialUseCase } from '../../application/use-cases/delete-material.use-case';
import { CreateMaterialDto } from '../../application/dto/create-material.dto';
import { UpdateMaterialDto } from '../../application/dto/update-material.dto';

@Controller({ path: 'materials', version: '1' })
@UseGuards(JwtAuthGuard)
export class MaterialsController {
  constructor(
    private readonly listMaterialsUseCase: ListMaterialsUseCase,
    private readonly createMaterialUseCase: CreateMaterialUseCase,
    private readonly updateMaterialUseCase: UpdateMaterialUseCase,
    private readonly deleteMaterialUseCase: DeleteMaterialUseCase,
  ) {}

  @Get()
  async list(@CurrentUser() user: JwtPayload): Promise<MaterialResponseDto[]> {
    return this.listMaterialsUseCase.execute(user.role);
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

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() body: UpdateMaterialDto,
  ): Promise<MaterialResponseDto> {
    return this.updateMaterialUseCase.execute(id, body);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(204)
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteMaterialUseCase.execute(id);
  }
}
