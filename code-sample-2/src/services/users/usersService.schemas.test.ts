import {describe, expect, test} from 'vitest';
import {GetUsersResponseSchema, UserSchema} from './usersService.schemas';

const validUser = {
  id: 1,
  name: 'Leanne Graham',
  username: 'Bret',
  email: 'Sincere@april.biz',
  phone: '1-770-736-8031 x56442',
  website: 'hildegard.org',
  company: {
    name: 'Romaguera-Crona',
    catchPhrase: 'Multi-layered client-server neural-net',
    bs: 'harness real-time e-markets',
  },
  address: {
    street: 'Kulas Light',
    suite: 'Apt. 556',
    city: 'Gwenborough',
    zipcode: '92998-3874',
  },
};

describe('UserSchema', () => {
  test.each([
    {
      description: 'valid user data',
      input: validUser,
      shouldPass: true,
    },
    {
      description: 'missing required field',
      input: {...validUser, name: undefined},
      shouldPass: false,
    },
  ])('should handle $description', ({input, shouldPass}) => {
    const result = UserSchema.safeParse(input);
    expect(result.success).toBe(shouldPass);
  });
});

describe('GetUsersResponseSchema', () => {
  test.each([
    {
      description: 'valid array of users',
      input: [validUser, {...validUser, id: 2, name: 'Ervin Howell'}],
      shouldPass: true,
    },
    {
      description: 'empty array',
      input: [],
      shouldPass: true,
    },
    {
      description: 'invalid item in array',
      input: [validUser, {id: 'not-a-number'}],
      shouldPass: false,
    },
  ])('should handle $description', ({input, shouldPass}) => {
    const result = GetUsersResponseSchema.safeParse(input);
    expect(result.success).toBe(shouldPass);
  });
});
