import { UserRole } from '../../../../common/domain/enums/user-role.enum';

export class AuthSessionDto {
  accessToken!: string;
  refreshToken!: string;
  user!: {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
  };
}
