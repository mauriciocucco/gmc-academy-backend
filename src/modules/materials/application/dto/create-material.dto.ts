import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MaterialLinkSource } from '../../../../common/domain/enums/material-link-source.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MaterialLinkInputDto {
  @ApiProperty({ enum: MaterialLinkSource })
  @IsEnum(MaterialLinkSource)
  sourceType!: MaterialLinkSource;

  @ApiProperty({ example: 'https://drive.google.com/...' })
  @IsUrl({ require_tld: false })
  url!: string;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  position?: number;
}

export class CreateMaterialDto {
  @ApiProperty({
    example: 'Introduction to NestJS',
    minLength: 3,
    maxLength: 160,
  })
  @IsString()
  @Length(3, 160)
  title!: string;

  @ApiProperty({
    example: 'Learn the basics of NestJS',
    minLength: 3,
    maxLength: 500,
  })
  @IsString()
  @Length(3, 500)
  description!: string;

  @ApiProperty({ example: 'backend', minLength: 2, maxLength: 50 })
  @IsString()
  @Length(2, 50)
  categoryKey!: string;

  @ApiProperty({ type: [MaterialLinkInputDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MaterialLinkInputDto)
  links!: MaterialLinkInputDto[];

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
