import { Outlet } from 'react-router-dom';

import BottomNav from './BottomNav';

export default function AppShell() {
  return (
    <div className="hirdavat-app-shell">
      <main>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
