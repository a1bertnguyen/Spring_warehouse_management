import React from "react";
import { Route } from "react-router-dom";
import { AdminRoute } from "../guards/RouteGuards";
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
    <Route path={PATHS.category} element={<AdminRoute element={<CategoryPage />} />} />
    <Route path={PATHS.supplier} element={<AdminRoute element={<SupplierPage />} />} />
    <Route
      path={PATHS.addSupplier}
      element={<AdminRoute element={<AddEditSupplierPage />} />}
    />
    <Route
      path={PATHS.editSupplier}
      element={<AdminRoute element={<AddEditSupplierPage />} />}
    />
    <Route path={PATHS.product} element={<AdminRoute element={<ProductPage />} />} />
    <Route path={PATHS.users} element={<AdminRoute element={<UserManagementPage />} />} />
    <Route
      path={PATHS.activityLogs}
      element={<AdminRoute element={<ActivityLogPage />} />}
    />
    <Route path={PATHS.addProduct} element={<AdminRoute element={<AddEditProductPage />} />} />
    <Route
      path={PATHS.editProduct}
      element={<AdminRoute element={<AddEditProductPage />} />}
    />
  </>
);

export default adminRoutes;
