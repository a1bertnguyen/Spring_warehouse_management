import React from "react";
import { useLocation } from "react-router-dom";
import ApiService from "../../services/ApiService";
import { PATHS } from "../../constants/paths";
import AdminDashboardPage from "./AdminDashboardPage";
import ManagerDashboardPage from "./ManagerDashboardPage";
import PurchaseStaffDashboardPage from "./PurchaseStaffDashboardPage";
import StaffDashboardPage from "./StaffDashboardPage";

const MANAGER_SECTION_BY_PATH = {
  [PATHS.dashboard]: "overview",
  [PATHS.dashboardWarehouses]: "warehouses",
  [PATHS.dashboardInventory]: "inventory",
  [PATHS.dashboardInventoryMovements]: "inventoryMovements",
  [PATHS.dashboardSalesOrders]: "salesOrders",
  [PATHS.dashboardPurchaseOrders]: "purchaseOrders",
  [PATHS.dashboardGoodsReceipts]: "goodsReceipts",
};

const PURCHASE_STAFF_SECTION_BY_PATH = {
  [PATHS.dashboard]: "overview",
  [PATHS.dashboardSuppliers]: "suppliers",
  [PATHS.dashboardInventory]: "inventory",
  [PATHS.dashboardPurchaseOrders]: "purchaseOrders",
  [PATHS.dashboardGoodsReceipts]: "goodsReceipts",
  [PATHS.dashboardInventoryMovements]: "inventoryMovements",
  [PATHS.dashboardCreateStockInward]: "createStockInward",
};

const DashboardPage = () => {
  const location = useLocation();
  const role = ApiService.getRole();

  if (ApiService.isAdmin()) {
    return <AdminDashboardPage initialSection="overview" />;
  }

  if (role === "MANAGER") {
    return (
      <ManagerDashboardPage
        activeSection={MANAGER_SECTION_BY_PATH[location.pathname] || "overview"}
      />
    );
  }

  if (role === "PURCHASE_STAFF") {
    return (
      <PurchaseStaffDashboardPage
        activeSection={
          PURCHASE_STAFF_SECTION_BY_PATH[location.pathname] || "overview"
        }
      />
    );
  }

  return <StaffDashboardPage />;
};

export default DashboardPage;
