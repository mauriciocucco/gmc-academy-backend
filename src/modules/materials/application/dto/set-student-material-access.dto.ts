import { IsBoolean } from 'class-validator';

export class SetStudentMaterialAccessDto {
  @IsBoolean()
  enabled!: boolean;
}
