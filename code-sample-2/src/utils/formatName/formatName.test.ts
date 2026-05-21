import {describe, expect, test} from 'bun:test';
import {formatFullName, getInitials} from './formatName';

describe('formatFullName', () => {
  test.each([
    {
      description: 'combines first and last name',
      firstName: 'John',
      lastName: 'Doe',
      expected: 'John Doe',
    },
    {
      description: 'trims whitespace when last name is empty',
      firstName: 'John',
      lastName: '',
      expected: 'John',
    },
    {
      description: 'truncates names exceeding max length',
      firstName: 'Bartholomew',
      lastName: 'Wolfeschlegelsteinhausenbergerdorff the Third of Canterbury',
      expected: 'Bartholomew Wolfeschlegelsteinhausenbergerdorff th...',
    },
  ])('should handle $description', ({firstName, lastName, expected}) => {
    expect(formatFullName(firstName, lastName)).toBe(expected);
  });
});

describe('getInitials', () => {
  test.each([
    {
      description: 'returns uppercase initials',
      firstName: 'john',
      lastName: 'doe',
      expected: 'JD',
    },
    {
      description: 'handles single character names',
      firstName: 'A',
      lastName: 'B',
      expected: 'AB',
    },
  ])('should handle $description', ({firstName, lastName, expected}) => {
    expect(getInitials(firstName, lastName)).toBe(expected);
  });
});
