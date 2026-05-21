import {StatusBadge} from './statusBadge/StatusBadge';
import type {UserDisplay} from './UserCard.types';
import {formatCity, truncateCompany} from './UserCard.utils';

type Props = {
  user: UserDisplay;
  onSelect: (userId: number) => void;
};

export function UserCard({user, onSelect}: Props) {
  return (
    <button
      type="button"
      className="cursor-pointer rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
      onClick={() => onSelect(user.id)}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{user.fullName}</h3>
        <StatusBadge status={user.status} />
      </div>
      <p className="mt-1 text-sm text-gray-500">{user.email}</p>
      <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
        <span>{truncateCompany(user.company)}</span>
        <span>&middot;</span>
        <span>{formatCity(user.city)}</span>
      </div>
    </button>
  );
}
