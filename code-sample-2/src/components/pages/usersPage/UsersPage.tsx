'use client';

import {useCallback, useMemo} from 'react';
import {mapUserToDisplay} from '@/components/pages/usersPage/UsersPage.utils';
import {Heading} from '@/components/ui/heading/Heading';
import {useSearch} from '@/hooks/useSearch/useSearch';
import {useGetUsers} from '@/services/users/usersService';
import type {UserDisplay} from './UsersPage.types';
import {UserList} from './userList/UserList';

export function UsersPage() {
  const {data: users, isLoading, error} = useGetUsers();

  const displayUsers = useMemo(() => (users ?? []).map(mapUserToDisplay), [users]);

  const searchFn = useCallback(
    (user: UserDisplay, query: string) =>
      user.fullName.toLowerCase().includes(query) || user.email.toLowerCase().includes(query),
    []
  );

  const {query, setQuery, filteredItems} = useSearch(displayUsers, searchFn);

  const handleSelectUser = (userId: number) => {
    console.log('Selected user:', userId);
  };

  if (isLoading) {
    return <p className="py-8 text-center">Loading users...</p>;
  }

  if (error) {
    return <p className="py-8 text-center text-red-500">Failed to load users.</p>;
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Heading level={1}>Users</Heading>
      <div className="mt-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div className="mt-6">
        <UserList users={filteredItems} onSelectUser={handleSelectUser} />
      </div>
    </main>
  );
}
