import {describe, expect, test} from 'bun:test';
import {UserSchema, GetUsersResponseSchema} from './usersService.schemas';

const mockUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'john@example.com',
  name: 'John Smith',
  status: 'active' as const,
};

describe('UserSchema', () => {
  test.each([
    {
      description: 'valid user passes',
      input: mockUser,
      shouldPass: true,
    },
    {
      description: 'invalid email fails',
      input: {...mockUser, email: 'not-an-email'},
      shouldPass: false,
    },
    {
      description: 'invalid status fails',
      input: {...mockUser, status: 'unknown'},
      shouldPass: false,
    },
    {
      description: 'missing name fails',
      input: {id: mockUser.id, email: mockUser.email, status: mockUser.status},
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
      description: 'valid response passes',
      input: {users: [mockUser], totalCount: 1, page: 1, pageSize: 10},
      shouldPass: true,
    },
    {
      description: 'empty users array passes',
      input: {users: [], totalCount: 0, page: 1, pageSize: 10},
      shouldPass: true,
    },
    {
      description: 'missing totalCount fails',
      input: {users: [mockUser], page: 1, pageSize: 10},
      shouldPass: false,
    },
  ])('should handle $description', ({input, shouldPass}) => {
    const result = GetUsersResponseSchema.safeParse(input);

    expect(result.success).toBe(shouldPass);
  });
});
