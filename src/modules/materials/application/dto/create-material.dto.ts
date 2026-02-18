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

export class MaterialLinkInputDto {
  @IsEnum(MaterialLinkSource)
  sourceType!: MaterialLinkSource;

  @IsUrl({ require_tld: false })
  url!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  position?: number;
}

export class CreateMaterialDto {
  @IsString()
  @Length(3, 160)
  title!: string;

  @IsString()
  @Length(3, 500)
  description!: string;

  @IsString()
  @Length(2, 50)
  categoryKey!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MaterialLinkInputDto)
  links!: MaterialLinkInputDto[];

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
