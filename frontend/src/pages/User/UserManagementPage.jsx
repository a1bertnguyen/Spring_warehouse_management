// Learning note: UserManagementPage is a thin route wrapper. The actual user
// management UI is a section inside AdminDashboardPage.
import React from "react";
import AdminDashboardPage from "../Dashboard/AdminDashboardPage";

const UserManagementPage = () => <AdminDashboardPage initialSection="users" />;

export default UserManagementPage;
