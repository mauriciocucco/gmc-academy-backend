import { UserRole } from '../../../../common/domain/enums/user-role.enum';

export class UserResponseDto {
  id!: string;
  email!: string;
  fullName!: string;
  phone!: string | null;
  role!: UserRole;
}
