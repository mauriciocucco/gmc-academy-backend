import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
} from 'class-validator';
import { MaterialCategory } from '../../../../common/domain/enums/material-category.enum';

export class CreateMaterialDto {
  @IsString()
  @Length(3, 160)
  title!: string;

  @IsString()
  @Length(3, 500)
  description!: string;

  @IsUrl({ require_tld: false })
  @Matches(/drive\.google\.com/i, {
    message: 'driveUrl must be a Google Drive URL',
  })
  driveUrl!: string;

  @IsEnum(MaterialCategory)
  category!: MaterialCategory;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
