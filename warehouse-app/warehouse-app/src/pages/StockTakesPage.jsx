import { useEffect, useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import Section from '../components/Section.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { warehouseApi, unwrapArray } from '../services/api.js';
import { formatDate, statusClass } from '../utils/format.js';

export default function StockTakesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stockTakes, setStockTakes] = useState([]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await warehouseApi.getStockTakes();
      setStockTakes(unwrapArray(res, ['stockTakes']));
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
          <h1>Stock Takes</h1>
          <p>One job only: monitor counting progress and discrepancy records.</p>
        </div>
      </div>
      <ErrorBanner message={error} />
      <Section title="Stock Takes" description="Monitor counting progress and discrepancy records." action={<button onClick={loadData}>Refresh</button>}>
        <DataTable rows={stockTakes} columns={[
          { key: 'stockTakeCode', label: 'Code' },
          { key: 'userFullName', label: 'Staff' },
          { key: 'stockTakeDate', label: 'Date', render: r => formatDate(r.stockTakeDate || r.createdAt) },
          { key: 'totalProducts', label: 'Products' },
          { key: 'completedProducts', label: 'Completed' },
          { key: 'discrepancyCount', label: 'Discrepancies' },
          { key: 'status', label: 'Status', render: r => <span className={statusClass(r.status)}>{r.status}</span> },
        ]} />
      </Section>
    </div>
  );
}
