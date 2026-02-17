import { UserRole } from '../../../../common/domain/enums/user-role.enum';

export type AccessTokenPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');

export interface TokenServicePort {
  signAccessToken(payload: AccessTokenPayload): Promise<string>;
  signRefreshToken(payload: AccessTokenPayload): Promise<string>;
  verifyRefreshToken(token: string): Promise<AccessTokenPayload>;
}
