import {describe, expect, test, jest, beforeEach, afterEach} from 'bun:test';
import {renderHook, act} from '@testing-library/react';
import {useDebounce} from './useDebounce';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('useDebounce', () => {
  test.each([
    {
      description: 'returns initial value immediately',
      initialValue: 'hello',
      delay: 300,
      expectedImmediate: 'hello',
    },
    {
      description: 'returns initial value for number type',
      initialValue: 42,
      delay: 500,
      expectedImmediate: 42,
    },
  ])('should handle $description', ({initialValue, delay, expectedImmediate}) => {
    const {result} = renderHook(() => useDebounce(initialValue, delay));

    expect(result.current).toBe(expectedImmediate);
  });

  test('should update value after delay', () => {
    const {result, rerender} = renderHook(({value, delay}) => useDebounce(value, delay), {
      initialProps: {value: 'initial', delay: 300},
    });

    rerender({value: 'updated', delay: 300});

    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe('updated');
  });
});
