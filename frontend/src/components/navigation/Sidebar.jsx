import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import ApiService from "../../services/ApiService";
import { PATHS } from "../../constants/paths";

const ADMIN_NAV_ITEMS = [
  { path: PATHS.dashboard, label: "Statistics", icon: "dashboard" },
  { path: PATHS.users, label: "User Management", icon: "users" },
  { path: PATHS.activityLogs, label: "Activity Log", icon: "activity" },
];

const MANAGER_NAV_ITEMS = [
  { path: PATHS.dashboard, label: "Overview", icon: "dashboard" },
  { path: PATHS.category, label: "Categories", icon: "categories" },
  { path: PATHS.dashboardWarehouses, label: "Warehouses", icon: "warehouse" },
  { path: PATHS.supplier, label: "Suppliers", icon: "suppliers" },
  { path: PATHS.product, label: "Products", icon: "products" },
  { path: PATHS.dashboardInventory, label: "Inventory", icon: "inventory" },
  { path: PATHS.dashboardSalesOrders, label: "Sales Orders", icon: "sales" },
  {
    path: PATHS.dashboardPurchaseOrders,
    label: "Purchase Orders",
    icon: "purchase",
  },
  {
    path: PATHS.dashboardGoodsReceipts,
    label: "Stock Inwards",
    icon: "receipts",
  },
];

const STAFF_NAV_ITEMS = [{ path: PATHS.dashboard, label: "Dashboard", icon: "dashboard" }];

function formatRoleLabel(role) {
  if (!role) {
    return "Account";
  }

  return role
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function NavIcon({ name }) {
  const icons = {
    dashboard: (
      <path d="M4 4h6v6H4zm10 0h6v10h-6zM4 14h6v6H4zm10 0h6v6h-6z" />
    ),
    users: (
      <path d="M9 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm6 1a2.5 2.5 0 1 0-2.5-2.5A2.5 2.5 0 0 0 15 12Zm-6 2c-3.314 0-6 1.79-6 4v1h12v-1c0-2.21-2.686-4-6-4Zm6 1c-.756 0-1.474.1-2.134.282A4.627 4.627 0 0 1 17 19h4v-.75C21 16.455 18.314 15 15 15Z" />
    ),
    activity: (
      <path d="M4 13h4l2-6 4 10 2-4h4" />
    ),
    categories: (
      <path d="M4 5h7v5H4zm9 0h7v5h-7zM4 14h7v5H4zm9 0h7v5h-7z" />
    ),
    warehouse: (
      <path d="M3 10 12 4l9 6v9h-5v-5H8v5H3z" />
    ),
    suppliers: (
      <path d="M5 6h14v13H5zM8 10h3m-3 4h8M8 6V4h8v2" />
    ),
    products: (
      <path d="M12 3 4 7v10l8 4 8-4V7Zm0 0 8 4M12 3 4 7m8 0v14" />
    ),
    inventory: (
      <path d="M5 5h14v4H5zm0 5h14v4H5zm0 5h14v4H5z" />
    ),
    sales: (
      <path d="M5 17 11 11l3 3 5-6M17 8h2v2" />
    ),
    purchase: (
      <path d="M12 4v12m0 0 4-4m-4 4-4-4M5 20h14" />
    ),
    receipts: (
      <path d="M7 4h10l2 3v13l-3-1.5L13 20l-3-1.5L7 20V4Zm3 5h4m-4 4h4" />
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {icons[name] || icons.dashboard}
    </svg>
  );
}

const Sidebar = () => {
  const navigate = useNavigate();
  const isAuth = ApiService.isAuthenticated();
  const isAdmin = ApiService.isAdmin();
  const role = ApiService.getRole();
  const isManager = isAuth && role === "MANAGER";
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCurrentUser() {
      try {
        const response = await ApiService.getLoggedInUserInfo();

        if (isMounted) {
          setCurrentUser(response?.user || null);
        }
      } catch {
        if (isMounted) {
          setCurrentUser(null);
        }
      }
    }

    if (isAuth) {
      loadCurrentUser();
    }

    return () => {
      isMounted = false;
    };
  }, [isAuth]);

  const navItems = useMemo(() => {
    if (!isAuth) {
      return [];
    }

    if (isAdmin) {
      return ADMIN_NAV_ITEMS;
    }

    return isManager ? MANAGER_NAV_ITEMS : STAFF_NAV_ITEMS;
  }, [isAdmin, isAuth, isManager]);

  const displayName = currentUser?.name || (isAdmin ? "admin" : "user");
  const displayRole = isAdmin
    ? "Administrator"
    : formatRoleLabel(currentUser?.role || ApiService.getRole());
  const avatarLetter = displayName.trim().charAt(0).toUpperCase() || "U";

  const logout = async (event) => {
    event.preventDefault();

    try {
      await ApiService.logoutUser();
    } catch {
      ApiService.clearAuth();
    } finally {
      navigate(PATHS.login, {
        replace: true,
        state: { message: "Logged out successfully." },
      });
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-shell">
        <div className="sidebar-brand">
          <p>Operations hub</p>
          <h1>Warehouse Manager</h1>
        </div>

        {isAuth && (
          <button
            type="button"
            className="sidebar-account"
            onClick={() => navigate(PATHS.profile)}
          >
            <div className="sidebar-avatar">{avatarLetter}</div>

            <div className="sidebar-account-copy">
              <strong>{displayName}</strong>
              <span>{displayRole}</span>
            </div>

            <span className="sidebar-account-chevron" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="m7 10 5 5 5-5" />
              </svg>
            </span>
          </button>
        )}

        {isAuth && (
          <nav className="sidebar-nav" aria-label="Primary navigation">
            <ul className="nav-links">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === PATHS.dashboard}
                    className={({ isActive }) =>
                      isActive ? "sidebar-link active" : "sidebar-link"
                    }
                  >
                    <span className="sidebar-link-icon">
                      <NavIcon name={item.icon} />
                    </span>
                    <span className="sidebar-link-label">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      {isAuth && (
        <button type="button" className="sidebar-logout" onClick={logout}>
          Logout
        </button>
      )}
    </div>
  );
};

export default Sidebar;
