import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import ApiService from "../../services/ApiService";
import { PATHS } from "../../constants/paths";

const ADMIN_NAV_ITEMS = [
  { path: PATHS.dashboard, label: "Statistics" },
  { path: PATHS.users, label: "User Management" },
  { path: PATHS.activityLogs, label: "Activity Log" },
];

const STAFF_NAV_ITEMS = [{ path: PATHS.dashboard, label: "Dashboard" }];

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

const Sidebar = () => {
  const navigate = useNavigate();
  const isAuth = ApiService.isAuthenticated();
  const isAdmin = ApiService.isAdmin();
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

    return isAdmin ? ADMIN_NAV_ITEMS : STAFF_NAV_ITEMS;
  }, [isAdmin, isAuth]);

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
          <p>Warehouse</p>
          <h1>Warehouse Management</h1>
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

            <span className="sidebar-account-chevron">v</span>
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
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    {item.label}
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
