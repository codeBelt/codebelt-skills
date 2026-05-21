import {useMemo} from 'react';
import {formatUserName} from './UserCard.utils';
import {CardBadge} from './cardBadge/CardBadge';
import type {User} from './UserCard.types';

type Props = {
  user: User;
  onSelect: (userId: string) => void;
};

export function UserCard({user, onSelect}: Props) {
  const fullName = useMemo(() => formatUserName(user.name), [user.name]);

  return (
    <div onClick={() => onSelect(user.id)}>
      <CardBadge status={user.status} />
      <span>{fullName}</span>
      <span>{user.email}</span>
    </div>
  );
}
