import {maxNameLength} from './formatName.constants';

export function formatFullName(firstName: string, lastName: string): string {
  const full = `${firstName} ${lastName}`.trim();

  return full.length > maxNameLength ? `${full.slice(0, maxNameLength)}...` : full;
}

export function getInitials(firstName: string, lastName: string): string {
  const first = firstName.charAt(0).toUpperCase();
  const last = lastName.charAt(0).toUpperCase();

  return `${first}${last}`;
}
