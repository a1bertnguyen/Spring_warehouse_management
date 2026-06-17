import { useEffect, useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import Section from '../components/Section.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { purchasingApi, unwrapArray } from '../services/api.js';
import { formatDate, formatMoney, statusClass } from '../utils/format.js';

const orderStatuses = ['DRAFT', 'SENT', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'];

export default function PurchaseOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await purchasingApi.getPurchaseOrders({ page: 0, size: 30 });
      setOrders(unwrapArray(res, ['purchaseOrders', 'orders']));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const updateStatus = async (id, status) => {
    await purchasingApi.updatePurchaseOrderStatus(id, status);
    await loadData();
  };

  if (loading) return <LoadingState />;

  return (
    <div className="page">
      <div className="page-title">
        <div>
          <span className="eyebrow">Purchasing Staff</span>
          <h1>Purchase Orders</h1>
          <p>One job only: track purchase orders from draft to received.</p>
        </div>
      </div>
      <ErrorBanner message={error} />
      <Section title="Purchase Orders" description="Track order lifecycle from draft to received." action={<button onClick={loadData}>Refresh</button>}>
        <DataTable rows={orders} columns={[
          { key: 'orderCode', label: 'Code' },
          { key: 'purchaseRequestCode', label: 'Request' },
          { key: 'supplierName', label: 'Supplier' },
          { key: 'warehouseName', label: 'Warehouse' },
          { key: 'totalItems', label: 'Items' },
          { key: 'totalEstimatedAmount', label: 'Amount', render: r => formatMoney(r.totalEstimatedAmount) },
          { key: 'status', label: 'Status', render: r => <span className={statusClass(r.status)}>{r.status}</span> },
          { key: 'orderDate', label: 'Date', render: r => formatDate(r.orderDate || r.createdAt) },
          { key: 'actions', label: 'Action', render: r => <select defaultValue="" onChange={e => e.target.value && updateStatus(r.id, e.target.value)}><option value="">Update</option>{orderStatuses.map(s => <option key={s}>{s}</option>)}</select> },
        ]} />
      </Section>
    </div>
  );
}
