import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetMaterialViewedDto {
  @ApiProperty({ description: 'true to mark as viewed, false to unmark' })
  @IsBoolean()
  viewed!: boolean;
}
