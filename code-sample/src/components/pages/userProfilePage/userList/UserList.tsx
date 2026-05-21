import {UserCard} from '@/components/shared/userCard/UserCard';
import type {UserSchema} from '@/services/hyperion/users/usersService.schemas';

type Props = {
  users: UserSchema[];
  onSelect: (userId: string) => void;
};

export function UserList({users, onSelect}: Props) {
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>
          <UserCard user={user} onSelect={onSelect} />
        </li>
      ))}
    </ul>
  );
}
