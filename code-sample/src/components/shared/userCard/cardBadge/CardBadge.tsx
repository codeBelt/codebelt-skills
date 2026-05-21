type Props = {
  status: 'active' | 'inactive';
};

export function CardBadge({status}: Props) {
  return <span className={status}>{status}</span>;
}
