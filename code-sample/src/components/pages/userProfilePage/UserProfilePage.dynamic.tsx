'use client';
import dynamic from 'next/dynamic';
import type {UserProfilePage} from './UserProfilePage';

export const UserProfilePageDynamic = dynamic(
  () => import('./UserProfilePage').then((mod) => mod.UserProfilePage),
  {
    ssr: false,
  },
) as typeof UserProfilePage;
