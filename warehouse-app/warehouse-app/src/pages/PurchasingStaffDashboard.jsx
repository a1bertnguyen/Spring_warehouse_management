import { useEffect, useMemo, useState } from 'react';
import { ClipboardList, FileText, Users } from 'lucide-react';
import DashboardCard from '../components/DashboardCard.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { purchasingApi, unwrapArray } from '../services/api.js';

export default function PurchasingStaffDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requests, setRequests] = useState([]);
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError('');
      try {
        const [reqRes, orderRes, supplierRes] = await Promise.all([
          purchasingApi.getPurchaseRequests({ page: 0, size: 20 }),
          purchasingApi.getPurchaseOrders({ page: 0, size: 20 }),
          purchasingApi.getSuppliers(),
        ]);
        setRequests(unwrapArray(reqRes, ['purchaseRequests', 'requests']));
        setOrders(unwrapArray(orderRes, ['purchaseOrders', 'orders']));
        setSuppliers(unwrapArray(supplierRes, ['suppliers']));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const pendingRequests = useMemo(() => requests.filter(r => String(r.status).includes('PENDING')).length, [requests]);
  const activeOrders = useMemo(() => orders.filter(o => !['RECEIVED', 'CANCELLED'].includes(String(o.status))).length, [orders]);

  if (loading) return <LoadingState />;

  return (
    <div className="page">
      <div className="page-title">
        <div>
          <span className="eyebrow">Purchasing Staff</span>
          <h1>Dashboard</h1>
          <p>This page only shows purchasing summary. Use the sidebar to work with requests, orders, or suppliers.</p>
        </div>
      </div>

      <ErrorBanner message={error} />

      <div className="cards-grid">
        <DashboardCard title="Purchase Requests" value={requests.length} hint={`${pendingRequests} pending`} icon={<ClipboardList size={24} />} />
        <DashboardCard title="Purchase Orders" value={orders.length} hint={`${activeOrders} active`} icon={<FileText size={24} />} />
        <DashboardCard title="Suppliers" value={suppliers.length} hint="Vendor records" icon={<Users size={24} />} />
      </div>
    </div>
  );
}
