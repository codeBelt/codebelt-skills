import {defaultDateFormat, defaultLocale} from './date.constants';
import type {DateFormatOptions} from './date.types';

export function formatDate(date: Date, options: DateFormatOptions = {}): string {
  const {format = defaultDateFormat, locale = defaultLocale} = options;

  return new Intl.DateTimeFormat(locale, format).format(date);
}

export function isExpired(date: Date): boolean {
  return date.getTime() < Date.now();
}

export function getDaysBetween(startDate: Date, endDate: Date): number {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const diffInMs = Math.abs(endDate.getTime() - startDate.getTime());

  return Math.floor(diffInMs / millisecondsPerDay);
}
