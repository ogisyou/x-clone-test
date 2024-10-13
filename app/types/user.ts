// app/types/user.ts

import { User as FirebaseUser } from 'firebase/auth';

export interface User extends FirebaseUser {
  username?: string;
  bio?: string;
  birthplace?: string;
  birthDate?: string;
  displayName: string | null;
  isAnonymous: boolean;
}