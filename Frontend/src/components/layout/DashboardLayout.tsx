// layouts/DashboardLayout.tsx
import { Outlet } from 'react-router-dom';
import {Layout} from './Layout'; // adjust path if needed

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Layout />
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
