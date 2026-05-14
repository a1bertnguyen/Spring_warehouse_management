import { useEffect, useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import Section from '../components/Section.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { warehouseApi, unwrapArray } from '../services/api.js';
import { formatDate, statusClass } from '../utils/format.js';

export default function StockInwardsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stockInwards, setStockInwards] = useState([]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await warehouseApi.getStockInwards();
      setStockInwards(unwrapArray(res, ['stockInwards']));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return <LoadingState />;

  return (
    <div className="page">
      <div className="page-title">
        <div>
          <span className="eyebrow">Warehouse Staff</span>
          <h1>Stock Inwards</h1>
          <p>One job only: view received batches and warehouse receiving records.</p>
        </div>
      </div>
      <ErrorBanner message={error} />
      <Section title="Stock Inwards" description="View received batches and warehouse receiving records." action={<button onClick={loadData}>Refresh</button>}>
        <DataTable rows={stockInwards} columns={[
          { key: 'inwardCode', label: 'Code' },
          { key: 'purchaseOrderCode', label: 'PO Code' },
          { key: 'supplierName', label: 'Supplier' },
          { key: 'warehouseName', label: 'Warehouse' },
          { key: 'totalItems', label: 'Items' },
          { key: 'totalReceivedQuantity', label: 'Received Qty' },
          { key: 'status', label: 'Status', render: r => <span className={statusClass(r.status)}>{r.status}</span> },
          { key: 'inwardDate', label: 'Date', render: r => formatDate(r.inwardDate || r.createdAt) },
        ]} />
      </Section>
    </div>
  );
}
