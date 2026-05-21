import {useMemo, useState} from 'react';

export function useSearch<T>(items: T[], searchFn: (item: T, query: string) => boolean) {
  const [query, setQuery] = useState('');

  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      return items;
    }

    return items.filter((item) => searchFn(item, query.toLowerCase()));
  }, [items, query, searchFn]);

  return {query, setQuery, filteredItems};
}
