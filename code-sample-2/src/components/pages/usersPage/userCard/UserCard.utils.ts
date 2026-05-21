import {maxCompanyLength} from './UserCard.constants';

export function truncateCompany(companyName: string): string {
  return companyName.length > maxCompanyLength ? `${companyName.slice(0, maxCompanyLength)}...` : companyName;
}

export function formatCity(city: string): string {
  return city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
}
