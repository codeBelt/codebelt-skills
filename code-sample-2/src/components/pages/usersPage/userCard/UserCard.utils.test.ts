import {describe, expect, test} from 'bun:test';
import {formatCity, truncateCompany} from './UserCard.utils';

describe('truncateCompany', () => {
  test.each([
    {
      description: 'short company name unchanged',
      input: 'Acme Inc',
      expected: 'Acme Inc',
    },
    {
      description: 'long company name truncated with ellipsis',
      input: 'International Business Machines Corporation Global',
      expected: 'International Business Machine...',
    },
    {
      description: 'exactly max length unchanged',
      input: 'A'.repeat(30),
      expected: 'A'.repeat(30),
    },
  ])('should handle $description', ({input, expected}) => {
    expect(truncateCompany(input)).toBe(expected);
  });
});

describe('formatCity', () => {
  test.each([
    {
      description: 'capitalizes first letter',
      input: 'gwenborough',
      expected: 'Gwenborough',
    },
    {
      description: 'lowercases rest of string',
      input: 'NEW YORK',
      expected: 'New york',
    },
  ])('should handle $description', ({input, expected}) => {
    expect(formatCity(input)).toBe(expected);
  });
});
