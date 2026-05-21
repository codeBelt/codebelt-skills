import {act, renderHook} from '@testing-library/react';
import {describe, expect, test} from 'bun:test';
import {useSearch} from './useSearch';

type Item = {
  name: string;
};

const mockItems: Item[] = [{name: 'Alice'}, {name: 'Bob'}, {name: 'Charlie'}];

const searchByName = (item: Item, query: string) => item.name.toLowerCase().includes(query);

describe('useSearch', () => {
  test.each([
    {
      description: 'returns all items when query is empty',
      query: '',
      expectedCount: 3,
    },
    {
      description: 'filters items by query',
      query: 'ali',
      expectedCount: 1,
    },
    {
      description: 'returns empty array when no matches',
      query: 'xyz',
      expectedCount: 0,
    },
  ])('should handle $description', ({query, expectedCount}) => {
    const {result} = renderHook(() => useSearch(mockItems, searchByName));

    act(() => {
      result.current.setQuery(query);
    });

    expect(result.current.filteredItems).toHaveLength(expectedCount);
  });
});
