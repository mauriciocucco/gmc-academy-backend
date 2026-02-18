import { UserRole } from '../../../../common/domain/enums/user-role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 'uuid-v4' })
  id!: string;

  @ApiProperty({ example: 'student@gmc.com' })
  email!: string;

  @ApiProperty({ example: 'John Doe' })
  fullName!: string;

  @ApiProperty({ example: '+1234567890', nullable: true })
  phone!: string | null;

  @ApiProperty({
    example: 'https://res.cloudinary.com/demo/image/upload/v123/profile.jpg',
    nullable: true,
  })
  profilePhotoUrl!: string | null;

  @ApiProperty({ enum: UserRole })
  role!: UserRole;
}
