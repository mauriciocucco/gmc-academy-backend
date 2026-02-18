import { MaterialLinkSource } from '../../../../common/domain/enums/material-link-source.enum';
import { ApiProperty } from '@nestjs/swagger';

class MaterialCategoryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  key!: string;

  @ApiProperty()
  name!: string;
}

class MaterialLinkDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: MaterialLinkSource })
  sourceType!: MaterialLinkSource;

  @ApiProperty()
  url!: string;

  @ApiProperty()
  position!: number;
}

export class MaterialResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  published!: boolean;

  @ApiProperty()
  publishedAt!: string;

  @ApiProperty()
  createdById!: string;

  @ApiProperty({ type: MaterialCategoryDto })
  category!: MaterialCategoryDto;

  @ApiProperty({ type: [MaterialLinkDto] })
  links!: MaterialLinkDto[];
}

export class MaterialCategoryResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  key!: string;

  @ApiProperty()
  name!: string;
}
