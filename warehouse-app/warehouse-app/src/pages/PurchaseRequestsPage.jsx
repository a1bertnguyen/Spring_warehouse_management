import { useEffect, useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import Section from '../components/Section.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { purchasingApi, unwrapArray } from '../services/api.js';
import { formatDate, formatMoney, statusClass } from '../utils/format.js';

const requestStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'ORDERED', 'CANCELLED'];

export default function PurchaseRequestsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requests, setRequests] = useState([]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await purchasingApi.getPurchaseRequests({ page: 0, size: 30 });
      setRequests(unwrapArray(res, ['purchaseRequests', 'requests']));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const updateStatus = async (id, status) => {
    await purchasingApi.updatePurchaseRequestStatus(id, status);
    await loadData();
  };

  if (loading) return <LoadingState />;

  return (
    <div className="page">
      <div className="page-title">
        <div>
          <span className="eyebrow">Purchasing Staff</span>
          <h1>Purchase Requests</h1>
          <p>One job only: review purchase requests and update their status.</p>
        </div>
      </div>
      <ErrorBanner message={error} />
      <Section title="Purchase Requests" description="Review request status and update the workflow." action={<button onClick={loadData}>Refresh</button>}>
        <DataTable rows={requests} columns={[
          { key: 'requestCode', label: 'Code' },
          { key: 'requesterName', label: 'Requester' },
          { key: 'supplierName', label: 'Supplier' },
          { key: 'warehouseName', label: 'Warehouse' },
          { key: 'totalItems', label: 'Items' },
          { key: 'totalEstimatedAmount', label: 'Estimated', render: r => formatMoney(r.totalEstimatedAmount) },
          { key: 'status', label: 'Status', render: r => <span className={statusClass(r.status)}>{r.status}</span> },
          { key: 'requestDate', label: 'Date', render: r => formatDate(r.requestDate || r.createdAt) },
          { key: 'actions', label: 'Action', render: r => <select defaultValue="" onChange={e => e.target.value && updateStatus(r.id, e.target.value)}><option value="">Update</option>{requestStatuses.map(s => <option key={s}>{s}</option>)}</select> },
        ]} />
      </Section>
    </div>
  );
}
