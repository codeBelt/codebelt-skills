import {useMemo} from 'react';
import {useGetUsers} from '@/services/hyperion/users/usersService';
import {ProfileView} from './profileView/ProfileView';
import {UserList} from './userList/UserList';

type Props = {
  pageSize: number;
};

export function UserProfilePage({pageSize}: Props) {
  const {data, isLoading} = useGetUsers(1, pageSize);

  const activeUsers = useMemo(() => {
    return data?.users.filter((user) => user.status === 'active') ?? [];
  }, [data?.users]);

  const totalActive = activeUsers.length;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>User Profiles ({totalActive} active)</h1>
      <ProfileView user={activeUsers[0]} />
      <UserList users={activeUsers} onSelect={(userId) => console.log(userId)} />
    </div>
  );
}
