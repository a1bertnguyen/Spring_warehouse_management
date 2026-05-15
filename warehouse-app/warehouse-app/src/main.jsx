import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import App from './App.jsx';
import Login from './pages/Login.jsx';
import PurchasingStaffDashboard from './pages/PurchasingStaffDashboard.jsx';
import PurchaseRequestsPage from './pages/PurchaseRequestsPage.jsx';
import PurchaseOrdersPage from './pages/PurchaseOrdersPage.jsx';
import SuppliersPage from './pages/SuppliersPage.jsx';
import WarehouseStaffDashboard from './pages/WarehouseStaffDashboard.jsx';
import StockInwardsPage from './pages/StockInwardsPage.jsx';
import StockTakesPage from './pages/StockTakesPage.jsx';
import InventoryMovementsPage from './pages/InventoryMovementsPage.jsx';
import WarehouseTasksPage from './pages/WarehouseTasksPage.jsx';
import NotAuthorized from './pages/NotAuthorized.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<App />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<RoleHome />} />

          <Route path="purchasing-staff" element={<RequireRole role="PURCHASE_STAFF" />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<PurchasingStaffDashboard />} />
            <Route path="requests" element={<PurchaseRequestsPage />} />
            <Route path="orders" element={<PurchaseOrdersPage />} />
            <Route path="suppliers" element={<SuppliersPage />} />
          </Route>

          <Route path="warehouse-staff" element={<RequireRole role="WAREHOUSE_STAFF" />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<WarehouseStaffDashboard />} />
            <Route path="stock-inwards" element={<StockInwardsPage />} />
            <Route path="stock-takes" element={<StockTakesPage />} />
            <Route path="movements" element={<InventoryMovementsPage />} />
            <Route path="tasks" element={<WarehouseTasksPage />} />
          </Route>

          <Route path="not-authorized" element={<NotAuthorized />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

function RoleHome() {
  const user = getUser();
  if (!user?.token) return <Navigate to="/login" replace />;
  if (user.role === 'PURCHASE_STAFF') return <Navigate to="/purchasing-staff/dashboard" replace />;
  if (user.role === 'WAREHOUSE_STAFF') return <Navigate to="/warehouse-staff/dashboard" replace />;
  return <Navigate to="/not-authorized" replace />;
}

function RequireRole({ role }) {
  const user = getUser();
  if (!user?.token) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/not-authorized" replace />;
  return <AppOutlet />;
}

function AppOutlet() {
  return <Outlet />;
}

function getUser() {
  const rawUser = localStorage.getItem('warehouse_user');
  return rawUser ? JSON.parse(rawUser) : null;
}
