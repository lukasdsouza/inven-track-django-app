export interface User {
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'visualizador' | 'gestor';
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  canEdit: () => boolean;
  canDelete: () => boolean;
  canAdd: () => boolean;
  canManageUsers: () => boolean;
}

export const USERS: User[] = [
  {
    username: 'rodrigo',
    password: 'admin123',
    name: 'Rodrigo',
    role: 'admin'
  },
  {
    username: 'charles',
    password: 'visual123',
    name: 'Charles',
    role: 'visualizador'
  },
  {
    username: 'nelson',
    password: 'gestor123',
    name: 'Nelson',
    role: 'gestor'
  },
  {
    username: 'bruno',
    password: 'gestor123',
    name: 'Bruno',
    role: 'gestor'
  },
  {
    username: 'mauro',
    password: 'gestor123',
    name: 'Mauro',
    role: 'gestor'
  }
];