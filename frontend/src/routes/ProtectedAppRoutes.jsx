import React from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute } from "../guards/RouteGuards";
import { PATHS } from "../constants/paths";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import PurchasePage from "../pages/Purchase/PurchasePage";
import SellPage from "../pages/Sales/SellPage";
import TransactionsPage from "../pages/Transactions/TransactionsPage";
import TransactionDetailsPage from "../pages/Transactions/TransactionDetailsPage";
import ProfilePage from "../pages/Profile/ProfilePage";

const protectedAppRoutes = (
  <>
    <Route path={PATHS.purchase} element={<ProtectedRoute element={<PurchasePage />} />} />
    <Route path={PATHS.sell} element={<ProtectedRoute element={<SellPage />} />} />
    <Route
      path={PATHS.transaction}
      element={<ProtectedRoute element={<TransactionsPage />} />}
    />
    <Route
      path={PATHS.transactionDetails}
      element={<ProtectedRoute element={<TransactionDetailsPage />} />}
    />
    <Route path={PATHS.profile} element={<ProtectedRoute element={<ProfilePage />} />} />
    <Route path={PATHS.dashboard} element={<ProtectedRoute element={<DashboardPage />} />} />
    <Route
      path={PATHS.dashboardWarehouses}
      element={<ProtectedRoute element={<DashboardPage />} />}
    />
    <Route
      path={PATHS.dashboardSuppliers}
      element={<ProtectedRoute element={<DashboardPage />} />}
    />
    <Route
      path={PATHS.dashboardInventory}
      element={<ProtectedRoute element={<DashboardPage />} />}
    />
    <Route
      path={PATHS.dashboardInventoryMovements}
      element={<ProtectedRoute element={<DashboardPage />} />}
    />
    <Route
      path={PATHS.dashboardSalesOrders}
      element={<ProtectedRoute element={<DashboardPage />} />}
    />
    <Route
      path={PATHS.dashboardPurchaseRequests}
      element={<ProtectedRoute element={<DashboardPage />} />}
    />
    <Route
      path={PATHS.dashboardPurchaseOrders}
      element={<ProtectedRoute element={<DashboardPage />} />}
    />
    <Route
      path={PATHS.dashboardGoodsReceipts}
      element={<ProtectedRoute element={<DashboardPage />} />}
    />
    <Route
      path={PATHS.dashboardCreateStockInward}
      element={<ProtectedRoute element={<DashboardPage />} />}
    />
  </>
);

export default protectedAppRoutes;
