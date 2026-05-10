import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import ApiService from "../../services/ApiService";
import { PATHS } from "../../constants/paths";

const Sidebar = () => {
  const navigate = useNavigate();
  const isAuth = ApiService.isAuthenticated();
  const isAdmin = ApiService.isAdmin();

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
      <h1 className="ims">IMS</h1>
      <ul className="nav-links">
        {isAuth && (
          <li>
            <NavLink to={PATHS.dashboard}>Dashboard</NavLink>
          </li>
        )}

        {isAuth && (
          <li>
            <NavLink to={PATHS.transaction}>Transactions</NavLink>
          </li>
        )}

        {isAdmin && (
          <li>
            <NavLink to={PATHS.category}>Category</NavLink>
          </li>
        )}

        {isAdmin && (
          <li>
            <NavLink to={PATHS.product}>Product</NavLink>
          </li>
        )}

        {isAdmin && (
          <li>
            <NavLink to={PATHS.supplier}>Supplier</NavLink>
          </li>
        )}

        {isAdmin && (
          <li>
            <NavLink to={PATHS.users}>Users</NavLink>
          </li>
        )}

        {isAuth && (
          <li>
            <NavLink to={PATHS.purchase}>Purchase</NavLink>
          </li>
        )}

        {isAuth && (
          <li>
            <NavLink to={PATHS.sell}>Sell</NavLink>
          </li>
        )}

        {isAuth && (
          <li>
            <NavLink to={PATHS.profile}>Profile</NavLink>
          </li>
        )}

        {isAuth && (
          <li>
            <NavLink onClick={logout} to={PATHS.login}>Logout</NavLink>
          </li>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;
