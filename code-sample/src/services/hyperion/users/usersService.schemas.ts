import {z} from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  status: z.enum(['active', 'inactive']),
});
export type UserSchema = z.infer<typeof UserSchema>;

export const GetUsersResponseSchema = z.object({
  users: z.array(UserSchema),
  totalCount: z.number(),
  page: z.number(),
  pageSize: z.number(),
});
export type GetUsersResponseSchema = z.infer<typeof GetUsersResponseSchema>;

export const GetUserByIdResponseSchema = z.object({
  user: UserSchema,
});
export type GetUserByIdResponseSchema = z.infer<typeof GetUserByIdResponseSchema>;
