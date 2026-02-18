import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MaterialLinkInputDto } from './create-material.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMaterialDto {
  @ApiPropertyOptional({ minLength: 3, maxLength: 160 })
  @IsOptional()
  @IsString()
  @Length(3, 160)
  title?: string;

  @ApiPropertyOptional({ minLength: 3, maxLength: 500 })
  @IsOptional()
  @IsString()
  @Length(3, 500)
  description?: string;

  @ApiPropertyOptional({ minLength: 2, maxLength: 50 })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  categoryKey?: string;

  @ApiPropertyOptional({ type: [MaterialLinkInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaterialLinkInputDto)
  links?: MaterialLinkInputDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
