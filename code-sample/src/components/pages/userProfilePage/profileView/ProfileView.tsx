import type {UserSchema} from '@/services/hyperion/users/usersService.schemas';

type Props = {
  user: UserSchema | undefined;
};

export function ProfileView({user}: Props) {
  if (!user) {
    return <div>No user selected</div>;
  }

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}
