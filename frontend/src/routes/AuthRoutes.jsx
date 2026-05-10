import React from "react";
import { Route } from "react-router-dom";
import { PublicRoute } from "../guards/RouteGuards";
import { PATHS } from "../constants/paths";
import LoginPage from "../pages/Auth/LoginPage";

const authRoutes = (
  <>
    <Route path={PATHS.login} element={<PublicRoute element={<LoginPage />} />} />
  </>
);

export default authRoutes;
