import type {UserDisplay} from '@/components/pages/usersPage/UsersPage.types';
import type {UserSchema} from '@/services/users/usersService.schemas';

export function mapUserToDisplay(user: UserSchema): UserDisplay {
  return {
    id: user.id,
    fullName: user.name,
    email: user.email,
    company: user.company.name,
    city: user.address.city,
    status: user.id % 2 === 0 ? 'inactive' : 'active',
  };
}
