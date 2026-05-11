import React from "react";
import ApiService from "../../services/ApiService";
import AdminDashboardPage from "./AdminDashboardPage";
import StaffDashboardPage from "./StaffDashboardPage";

const DashboardPage = () =>
  ApiService.isAdmin() ? (
    <AdminDashboardPage initialSection="overview" />
  ) : (
    <StaffDashboardPage />
  );

export default DashboardPage;
