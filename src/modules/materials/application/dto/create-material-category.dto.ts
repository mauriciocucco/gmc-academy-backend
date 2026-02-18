import { IsLowercase, IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMaterialCategoryDto {
  @ApiProperty({
    example: 'backend',
    description: 'Lowercase letters, numbers and underscores only',
  })
  @IsString()
  @IsLowercase()
  @Length(2, 50)
  @Matches(/^[a-z0-9_]+$/, {
    message: 'key must contain only lowercase letters, numbers or underscores',
  })
  key!: string;

  @ApiProperty({ example: 'Backend', minLength: 2, maxLength: 80 })
  @IsString()
  @Length(2, 80)
  name!: string;
}
