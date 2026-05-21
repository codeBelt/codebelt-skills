import {describe, expect, test} from 'bun:test';
import {formatDate, isExpired, getDaysBetween} from './date';

describe('formatDate', () => {
  test.each([
    {
      description: 'formats date with default options',
      input: new Date('2024-01-15'),
      options: {},
      expected: 'January 15, 2024',
    },
    {
      description: 'formats date with custom locale',
      input: new Date('2024-01-15'),
      options: {locale: 'de-DE'},
      expected: '15. Januar 2024',
    },
  ])('should handle $description', ({input, options, expected}) => {
    expect(formatDate(input, options)).toBe(expected);
  });
});

describe('isExpired', () => {
  test.each([
    {
      description: 'past date is expired',
      input: new Date('2020-01-01'),
      expected: true,
    },
    {
      description: 'future date is not expired',
      input: new Date('2099-01-01'),
      expected: false,
    },
  ])('should handle $description', ({input, expected}) => {
    expect(isExpired(input)).toBe(expected);
  });
});

describe('getDaysBetween', () => {
  test.each([
    {
      description: 'same date returns 0',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-01'),
      expected: 0,
    },
    {
      description: 'one week apart returns 7',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-08'),
      expected: 7,
    },
    {
      description: 'order does not matter',
      startDate: new Date('2024-01-08'),
      endDate: new Date('2024-01-01'),
      expected: 7,
    },
  ])('should handle $description', ({startDate, endDate, expected}) => {
    expect(getDaysBetween(startDate, endDate)).toBe(expected);
  });
});
