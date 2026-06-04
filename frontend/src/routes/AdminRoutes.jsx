// Learning note: These routes are reserved for administrators and managers.
// The guard components decide whether the current role can open each page.
import React from "react";
import { Route } from "react-router-dom";
import { AdminRoute, ManagementRoute } from "../guards/RouteGuards";
import { PATHS } from "../constants/paths";
import CategoryPage from "../pages/Category/CategoryPage";
import SupplierPage from "../pages/Supplier/SupplierPage";
import AddEditSupplierPage from "../pages/Supplier/AddEditSupplierPage";
import ProductPage from "../pages/Product/ProductPage";
import AddEditProductPage from "../pages/Product/AddEditProductPage";
import UserManagementPage from "../pages/User/UserManagementPage";
import ActivityLogPage from "../pages/Activity/ActivityLogPage";

const adminRoutes = (
  <>
    <Route
      path={PATHS.category}
      element={<ManagementRoute element={<CategoryPage />} />}
    />
    <Route
      path={PATHS.supplier}
      element={<ManagementRoute element={<SupplierPage />} />}
    />
    <Route
      path={PATHS.addSupplier}
      element={<ManagementRoute element={<AddEditSupplierPage />} />}
    />
    <Route
      path={PATHS.editSupplier}
      element={<ManagementRoute element={<AddEditSupplierPage />} />}
    />
    <Route
      path={PATHS.product}
      element={<ManagementRoute element={<ProductPage />} />}
    />
    <Route path={PATHS.users} element={<AdminRoute element={<UserManagementPage />} />} />
    <Route
      path={PATHS.activityLogs}
      element={<AdminRoute element={<ActivityLogPage />} />}
    />
    <Route
      path={PATHS.addProduct}
      element={<ManagementRoute element={<AddEditProductPage />} />}
    />
    <Route
      path={PATHS.editProduct}
      element={<ManagementRoute element={<AddEditProductPage />} />}
    />
  </>
);

export default adminRoutes;
