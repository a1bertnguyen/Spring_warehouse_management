// Learning note: ActivityLogPage is a thin route wrapper. The actual activity
// log UI is a section inside AdminDashboardPage.
import React from "react";
import AdminDashboardPage from "../Dashboard/AdminDashboardPage";

const ActivityLogPage = () => <AdminDashboardPage initialSection="activity" />;

export default ActivityLogPage;
