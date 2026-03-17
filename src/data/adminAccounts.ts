export interface AdminAccount {
  id: string;
  username: string;
  password: string;
  role: 'Owner' | 'Manager' | 'Staff';
  active: boolean;
  loginCount: number;
  lastIp: string;
  lastLogin: string;
}

export const defaultAdminAccounts: AdminAccount[] = [
  {
    id: '1',
    username: 'Red.gov',
    password: '@@Redxvk2847!!',
    role: 'Owner',
    active: true,
    loginCount: 0,
    lastIp: '',
    lastLogin: '',
  },
  {
    id: '2',
    username: 'royku',
    password: '@@Royku9xm3!!',
    role: 'Owner',
    active: true,
    loginCount: 0,
    lastIp: '',
    lastLogin: '',
  },
  {
    id: '3',
    username: 'death',
    password: '@@Death7kz2!!',
    role: 'Owner',
    active: true,
    loginCount: 0,
    lastIp: '',
    lastLogin: '',
  },
];
