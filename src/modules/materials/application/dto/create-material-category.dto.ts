import { IsLowercase, IsString, Length, Matches } from 'class-validator';

export class CreateMaterialCategoryDto {
  @IsString()
  @IsLowercase()
  @Length(2, 50)
  @Matches(/^[a-z0-9_]+$/, {
    message: 'key must contain only lowercase letters, numbers or underscores',
  })
  key!: string;

  @IsString()
  @Length(2, 80)
  name!: string;
}
