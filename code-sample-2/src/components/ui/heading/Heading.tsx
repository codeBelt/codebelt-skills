import type {ReactNode} from 'react';

type Props = {
  level: 1 | 2 | 3;
  children: ReactNode;
};

export function Heading({level, children}: Props) {
  const Tag = `h${level}` as const;
  const className = level === 1 ? 'text-3xl font-bold' : level === 2 ? 'text-2xl font-semibold' : 'text-xl font-medium';

  return <Tag className={className}>{children}</Tag>;
}
