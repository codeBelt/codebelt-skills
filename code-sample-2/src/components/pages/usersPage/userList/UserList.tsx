import type {UserDisplay} from '../UsersPage.types';
import {UserCard} from '../userCard/UserCard';

type Props = {
  users: UserDisplay[];
  onSelectUser: (userId: number) => void;
};

export function UserList({users, onSelectUser}: Props) {
  if (users.length === 0) {
    return <p className="py-8 text-center text-gray-500">No users found.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {users.map((user) => (
        <UserCard key={user.id} user={user} onSelect={onSelectUser} />
      ))}
    </div>
  );
}
