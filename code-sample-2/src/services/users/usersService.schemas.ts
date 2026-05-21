import {z} from 'zod';

export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  username: z.string(),
  email: z.string(),
  phone: z.string(),
  website: z.string(),
  company: z.object({
    name: z.string(),
    catchPhrase: z.string(),
    bs: z.string(),
  }),
  address: z.object({
    street: z.string(),
    suite: z.string(),
    city: z.string(),
    zipcode: z.string(),
  }),
});
export type UserSchema = z.infer<typeof UserSchema>;

export const GetUsersResponseSchema = z.array(UserSchema);
export type GetUsersResponseSchema = z.infer<typeof GetUsersResponseSchema>;
