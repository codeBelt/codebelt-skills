export type UserStatus = 'active' | 'inactive';

export type UserDisplay = {
  id: number;
  fullName: string;
  email: string;
  company: string;
  city: string;
  status: UserStatus;
};
