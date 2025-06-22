// import { createContext, useContext, useState, ReactNode } from 'react';

// interface User {
//   email: string;
//   organization: string;
// }

// interface AuthContextType {
//   user: User | null;
//   login: (email: string, password: string) => Promise<void>;
//   register: (email: string, password: string) => Promise<void>;
//   logout: () => Promise<void>;
//   isAuthenticated: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);

//   const login = async (email: string, password: string) => {
//     const response = await fetch('http://localhost:5000/auth/login', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       credentials: 'include', // ✅ SEND COOKIE!
//       body: JSON.stringify({ email, password }),
//     });

//     if (!response.ok) {
//       throw new Error('Login failed');
//     }

//     // ✅ If login succeeded, you can GET /auth/me to fetch actual user:
//     const userInfo = await fetch('http://localhost:5000/auth/me', {
//       credentials: 'include',
//     });
//     if (userInfo.ok) {
//       const data = await userInfo.json();
//       setUser({ email: data.email, organization: data.organization });
//     }
//   };

//   const register = async (email: string, password: string) => {
//     const response = await fetch('http://localhost:5000/auth/register', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       credentials: 'include', // ✅ SEND COOKIE!
//       body: JSON.stringify({ email, password }),
//     });

//     if (!response.ok) {
//       throw new Error('Registration failed');
//     }

//     // ✅ Fetch /auth/me to sync user state
//     const userInfo = await fetch('http://localhost:5000/auth/me', {
//       credentials: 'include',
//     });
//     if (userInfo.ok) {
//       const data = await userInfo.json();
//       setUser({ email: data.email, organization: data.organization });
//     }
//   };

//   const logout = async () => {
//     // ✅ Tell server to clear cookie:
//     await fetch('http://localhost:5000/auth/logout', {
//       method: 'POST',
//       credentials: 'include',
//     });
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         login,
//         register,
//         logout,
//         isAuthenticated: !!user,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  email: string;
  organization: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean; // <-- new: so you know when it's fetching
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // ✅ Fetch current user once when component mounts
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('http://localhost:5000/auth/me', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setUser({ email: data.email, organization: data.organization });
        }
      } catch (error) {
        console.error('Failed to fetch user', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch('http://localhost:5000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    // fetch user info again
    const userInfo = await fetch('http://localhost:5000/auth/me', {
      credentials: 'include',
    });
    if (userInfo.ok) {
      const data = await userInfo.json();
      setUser({ email: data.email, organization: data.organization });
    }
  };
  
  const register = async (email: string, password: string) => {
    const response = await fetch('http://localhost:5000/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    const userInfo = await fetch('http://localhost:5000/auth/me', {
      credentials: 'include',
    });
    if (userInfo.ok) {
      const data = await userInfo.json();
      setUser({ email: data.email, organization: data.organization });
    }
  };

  const logout = async () => {
    await fetch('http://localhost:5000/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        loading, // provide loading state
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
