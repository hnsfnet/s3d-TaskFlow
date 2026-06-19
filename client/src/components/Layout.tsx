import { NavLink, Outlet } from 'react-router-dom';
import NotificationBell from './NotificationBell';

function Layout() {
  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-brand">TaskFlow</div>
        <div className="navbar-nav">
          <NavLink to="/" className="nav-link" end>
            项目
          </NavLink>
          <NavLink to="/members" className="nav-link">
            成员
          </NavLink>
        </div>
        <NotificationBell />
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
