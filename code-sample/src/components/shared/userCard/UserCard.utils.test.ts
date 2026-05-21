import {describe, expect, test} from 'bun:test';
import {formatUserName} from './UserCard.utils';

describe('formatUserName', () => {
  test.each([
    {
      description: 'short name is returned as-is',
      input: 'John Smith',
      expected: 'John Smith',
    },
    {
      description: 'name at exactly max length is returned as-is',
      input: 'A'.repeat(30),
      expected: 'A'.repeat(30),
    },
    {
      description: 'long name is truncated with ellipsis',
      input: 'A'.repeat(35),
      expected: 'A'.repeat(30) + '...',
    },
    {
      description: 'empty name is returned as-is',
      input: '',
      expected: '',
    },
  ])('should handle $description', ({input, expected}) => {
    expect(formatUserName(input)).toBe(expected);
  });
});
