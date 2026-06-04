// Learning note: This file is the main route table. It combines public auth
// routes, role-restricted management routes, and authenticated app routes.
import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { PATHS } from "../constants/paths";
import authRoutes from "./AuthRoutes";
import adminRoutes from "./AdminRoutes";
import protectedAppRoutes from "./ProtectedAppRoutes";

const AppRoutes = () => (
  <Routes>
    {authRoutes}
    {adminRoutes}
    {protectedAppRoutes}
    <Route path={PATHS.root} element={<Navigate to={PATHS.dashboard} replace />} />
    <Route path="*" element={<Navigate to={PATHS.dashboard} replace />} />
  </Routes>
);

export default AppRoutes;
