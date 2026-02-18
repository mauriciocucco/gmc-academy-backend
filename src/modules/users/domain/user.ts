import { UserRole } from '../../../common/domain/enums/user-role.enum';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  profilePhotoUrl: string | null;
  role: UserRole;
  passwordHash: string;
  refreshTokenHash: string | null;
  createdAt: Date;
}
