import {maxNameLength} from './UserCard.constants';

export function formatUserName(name: string): string {
  return name.length > maxNameLength ? `${name.slice(0, maxNameLength)}...` : name;
}
