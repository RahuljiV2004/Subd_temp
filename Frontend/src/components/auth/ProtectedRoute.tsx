// // import type { ReactNode } from 'react';
// // import { Navigate } from 'react-router-dom';
// // import { useAuth } from '../../context/AuthContext';

// // interface ProtectedRouteProps {
// //   children: ReactNode;
// // }

// // export function ProtectedRoute({ children }: ProtectedRouteProps) {
// //   const { isAuthenticated, user } = useAuth();

// //   if (!isAuthenticated) {
// //     return <Navigate to="/login" />;
// //   }

// //   return <>{children}</>;
// // } 
// import type { ReactNode } from 'react';
// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';

// interface ProtectedRouteProps {
//   children: ReactNode;
// }

// export function ProtectedRoute({ children }: ProtectedRouteProps) {
//   const { isAuthenticated, loading } = useAuth();

//   if (loading) {
//     // show spinner or placeholder while checking cookie/session
//     return <div className="text-white p-4">Checking session...</div>;
//   }

//   if (!isAuthenticated) {
//     return <Navigate to="/login" />;
//   }

//   return <>{children}</>;
// }
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-slate-400 mt-4">Checking session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}