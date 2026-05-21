import type {UserStatus} from '../UserCard.types';

type Props = {
  status: UserStatus;
};

export function StatusBadge({status}: Props) {
  return (
    <span
      className={
        status === 'active'
          ? 'inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800'
          : 'inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600'
      }
    >
      {status}
    </span>
  );
}
