import { UserRole } from '../../../../common/domain/enums/user-role.enum';
import { ApiProperty } from '@nestjs/swagger';

class AuthSessionUserDto {
  @ApiProperty({ example: 'uuid-v4' })
  id!: string;

  @ApiProperty({ example: 'student@gmc.com' })
  email!: string;

  @ApiProperty({ example: 'John Doe' })
  fullName!: string;

  @ApiProperty({ example: '+1234567890', nullable: true })
  phone!: string | null;

  @ApiProperty({ enum: UserRole })
  role!: UserRole;
}

export class AuthSessionDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  refreshToken!: string;

  @ApiProperty({ type: AuthSessionUserDto })
  user!: AuthSessionUserDto;
}
