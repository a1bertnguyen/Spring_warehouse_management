// Learning note: Public authentication routes live here. PublicRoute prevents
// already-authenticated users from going back to the login page.
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
