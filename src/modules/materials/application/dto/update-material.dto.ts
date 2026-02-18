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

export class UpdateMaterialDto {
  @IsOptional()
  @IsString()
  @Length(3, 160)
  title?: string;

  @IsOptional()
  @IsString()
  @Length(3, 500)
  description?: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  categoryKey?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaterialLinkInputDto)
  links?: MaterialLinkInputDto[];

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
