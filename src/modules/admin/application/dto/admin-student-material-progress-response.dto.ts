import { ApiProperty } from '@nestjs/swagger';

export class AdminStudentMaterialProgressCategoryResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  key!: string;

  @ApiProperty()
  name!: string;
}

export class AdminStudentMaterialProgressResponseDto {
  @ApiProperty()
  materialId!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty({ type: AdminStudentMaterialProgressCategoryResponseDto })
  category!: AdminStudentMaterialProgressCategoryResponseDto;

  @ApiProperty({ minimum: 0 })
  position!: number;

  @ApiProperty()
  viewed!: boolean;

  @ApiProperty({ nullable: true, format: 'date-time' })
  viewedAt!: string | null;

  @ApiProperty({ minimum: 0 })
  linksCount!: number;
}
