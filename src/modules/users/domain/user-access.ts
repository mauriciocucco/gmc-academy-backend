import { User } from './user';

export const USER_ACCESS_BLOCKED_MESSAGE = 'User access is blocked';

export function isUserBlocked(user: Pick<User, 'blockedAt'>): boolean {
  return user.blockedAt != null;
}
