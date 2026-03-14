import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangeMyPasswordDto {
  @ApiProperty({
    example: 'Abc12345',
    description: 'Current password, including the temporary password',
  })
  @IsString()
  @MinLength(6)
  currentPassword!: string;

  @ApiProperty({
    example: 'NuevaClave123',
    description: 'New password that will replace the current one',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  newPassword!: string;
}
