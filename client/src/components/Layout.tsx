import { NavLink, Outlet } from 'react-router-dom';

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
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
