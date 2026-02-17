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
  @IsUrl({ require_tld: false })
  @Matches(/drive\.google\.com/i, {
    message: 'driveUrl must be a Google Drive URL',
  })
  driveUrl?: string;

  @IsOptional()
  @IsEnum(MaterialCategory)
  category?: MaterialCategory;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
