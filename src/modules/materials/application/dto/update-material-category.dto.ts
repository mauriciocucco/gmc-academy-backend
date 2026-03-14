import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsLowercase,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class UpdateMaterialCategoryDto {
  @ApiPropertyOptional({
    example: 'backend',
    description: 'Lowercase letters, numbers and underscores only',
  })
  @IsOptional()
  @IsString()
  @IsLowercase()
  @Length(2, 50)
  @Matches(/^[a-z0-9_]+$/, {
    message: 'key must contain only lowercase letters, numbers or underscores',
  })
  key?: string;

  @ApiPropertyOptional({ example: 'Backend', minLength: 2, maxLength: 80 })
  @IsOptional()
  @IsString()
  @Length(2, 80)
  name?: string;
}
