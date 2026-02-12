import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

export type UserRole = "admin" | "membre" | "coach";

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
  telephone?: string;
  cin?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  isMembre: boolean;
  isCoach: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "fitzone_auth";

// Comptes démo pour le développement (à remplacer par API backend)
const DEMO_ACCOUNTS = [
  { email: "admin@fitzone.com", password: "admin123", role: "admin" as const, nom: "Admin", prenom: "FITZONE" },
  { email: "membre@fitzone.com", password: "membre123", role: "membre" as const, nom: "Martin", prenom: "Sophie", telephone: "06 12 34 56 78", cin: "AB123456" },
  { email: "coach@fitzone.com", password: "coach123", role: "coach" as const, nom: "P.", prenom: "Jean" },
];

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as User;
        setUser(parsed);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    const account = DEMO_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );
    if (account) {
      const userData: User = {
        id: account.role === "admin" ? "admin-1" : account.role === "coach" ? "coach-1" : "m1",
        nom: account.nom,
        prenom: account.prenom,
        email: account.email,
        role: account.role,
        telephone: (account as any).telephone,
        cin: (account as any).cin,
      };
      setUser(userData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAdmin: user?.role === "admin",
    isMembre: user?.role === "membre",
    isCoach: user?.role === "coach",
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthProvider, useAuth };
