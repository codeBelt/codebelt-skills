import {useQuery} from '@tanstack/react-query';
import {httpClient} from '@/utils/httpClient/httpClient';
import {apiBasePath} from '@/utils/httpClient/httpClient.constants';
import {getUsersKey, getUserByIdKey} from './usersService.constants';
import type {GetUsersResponseSchema, GetUserByIdResponseSchema} from './usersService.schemas';

/* GET /api/v1/users */
export async function getUsers(page: number, pageSize: number): Promise<GetUsersResponseSchema> {
  const response = await httpClient.get(`${apiBasePath}/users`, {
    params: {page, pageSize},
  });

  return response.data;
}

export function useGetUsers(page: number, pageSize: number) {
  return useQuery({
    queryKey: [getUsersKey, page, pageSize],
    queryFn: () => getUsers(page, pageSize),
  });
}

/* GET /api/v1/users/:userId */
export async function getUserById(userId: string): Promise<GetUserByIdResponseSchema> {
  const response = await httpClient.get(`${apiBasePath}/users/${userId}`);

  return response.data;
}

export function useGetUserById(userId: string) {
  return useQuery({
    queryKey: [getUserByIdKey, userId],
    queryFn: () => getUserById(userId),
  });
}
