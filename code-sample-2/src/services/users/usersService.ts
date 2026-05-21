import {useQuery} from '@tanstack/react-query';
import ky from 'ky';
import {baseUrl, getUserByIdKey, getUsersKey} from './usersService.constants';
import type {UserSchema} from './usersService.schemas';
import {GetUsersResponseSchema} from './usersService.schemas';

/* GET /users */
export async function getUsers(): Promise<GetUsersResponseSchema> {
  const data = await ky.get(`${baseUrl}/users`).json();

  return GetUsersResponseSchema.parse(data);
}

export function useGetUsers() {
  return useQuery({
    queryKey: [getUsersKey],
    queryFn: () => getUsers(),
  });
}

/* GET /users/:id */
export async function getUserById(userId: number): Promise<UserSchema> {
  const data = await ky.get(`${baseUrl}/users/${userId}`).json();

  return GetUsersResponseSchema.element.parse(data);
}

export function useGetUserById(userId: number) {
  return useQuery({
    queryKey: [getUserByIdKey, userId],
    queryFn: () => getUserById(userId),
    enabled: userId > 0,
  });
}
