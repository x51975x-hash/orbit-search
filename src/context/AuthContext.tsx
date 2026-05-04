import { createContext, useContext, useState, ReactNode } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface StoredUser extends AuthUser {
  passwordHash: string;
}

export type SocialProvider = 'google' | 'apple' | 'github';

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithProvider: (provider: SocialProvider) => void;
  logout: () => void;
}

const PROVIDER_PROFILES: Record<SocialProvider, Omit<AuthUser, 'id'>> = {
  google: { email: 'user@gmail.com',    name: 'Google User' },
  apple:  { email: 'user@icloud.com',   name: 'Apple User'  },
  github: { email: 'user@github.com',   name: 'GitHub User' },
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  register: async () => {},
  loginWithProvider: () => {},
  logout: () => {},
});

const USERS_KEY = 'orbit_users';
const SESSION_KEY = 'orbit_session';

// Lightweight deterministic hash (not cryptographic — client-only demo)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(16);
}

function loadUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function loadSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadSession);

  const login = async (email: string, password: string) => {
    const users = loadUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === simpleHash(password),
    );
    if (!found) throw new Error('Invalid email or password.');
    const session: AuthUser = { id: found.id, email: found.email, name: found.name };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
  };

  const register = async (email: string, password: string, name: string) => {
    const users = loadUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }
    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      email,
      name,
      passwordHash: simpleHash(password),
    };
    saveUsers([...users, newUser]);
    const session: AuthUser = { id: newUser.id, email: newUser.email, name: newUser.name };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
  };

  const loginWithProvider = (provider: SocialProvider) => {
    const profile = PROVIDER_PROFILES[provider];
    const session: AuthUser = { id: `${provider}-${simpleHash(profile.email)}`, ...profile };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, loginWithProvider, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
