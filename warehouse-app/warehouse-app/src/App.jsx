import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { ClipboardList, FileText, Home, ListTodo, LogOut, PackageSearch, Repeat2, Truck, Users, Warehouse } from 'lucide-react';

const roleMenus = {
  PURCHASE_STAFF: [
    { to: '/purchasing-staff/dashboard', label: 'Dashboard', icon: Home },
    { to: '/purchasing-staff/requests', label: 'Purchase Requests', icon: ClipboardList },
    { to: '/purchasing-staff/orders', label: 'Purchase Orders', icon: FileText },
    { to: '/purchasing-staff/suppliers', label: 'Suppliers', icon: Users },
  ],
  WAREHOUSE_STAFF: [
    { to: '/warehouse-staff/dashboard', label: 'Dashboard', icon: Home },
    { to: '/warehouse-staff/stock-inwards', label: 'Stock Inwards', icon: Truck },
    { to: '/warehouse-staff/stock-takes', label: 'Stock Takes', icon: Warehouse },
    { to: '/warehouse-staff/movements', label: 'Inventory Movements', icon: Repeat2 },
    { to: '/warehouse-staff/tasks', label: 'My Tasks', icon: ListTodo },
  ],
};

export default function App() {
  const navigate = useNavigate();
  const rawUser = localStorage.getItem('warehouse_user');
  const user = rawUser ? JSON.parse(rawUser) : null;

  if (!user?.token) return <Navigate to="/login" replace />;

  const logout = () => {
    localStorage.removeItem('warehouse_user');
    navigate('/login');
  };

  const menu = roleMenus[user.role] || [];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon"><PackageSearch size={24} /></div>
          <div>
            <h2>IMS</h2>
            <p>Inventory Management</p>
          </div>
        </div>

        <div className="profile-card">
          <span className="avatar">{user.role?.charAt(0) || 'U'}</span>
          <div>
            <strong>{formatRole(user.role)}</strong>
            <p>User ID: {user.userId || 'N/A'}</p>
          </div>
        </div>

        <nav className="menu">
          {menu.map(item => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => isActive ? 'active' : ''}>
                <Icon size={18} /> {item.label}
              </NavLink>
            );
          })}
        </nav>

        <button className="logout-btn" onClick={logout}>
          <LogOut size={18} /> Logout
        </button>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

function formatRole(role = '') {
  return role.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}
