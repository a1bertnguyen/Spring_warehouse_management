import { useEffect, useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import Section from '../components/Section.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { warehouseApi, unwrapArray } from '../services/api.js';
import { formatDate, statusClass } from '../utils/format.js';

export default function InventoryMovementsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [movements, setMovements] = useState([]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await warehouseApi.getInventoryMovements();
      setMovements(unwrapArray(res, ['inventoryMovements', 'movements']));
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
          <h1>Inventory Movements</h1>
          <p>One job only: track movement history for stock changes.</p>
        </div>
      </div>
      <ErrorBanner message={error} />
      <Section title="Inventory Movements" description="Track movement history for stock changes." action={<button onClick={loadData}>Refresh</button>}>
        <DataTable rows={movements} columns={[
          { key: 'movementId', label: 'ID', render: r => r.movementId || r.id },
          { key: 'productName', label: 'Product' },
          { key: 'warehouseName', label: 'Warehouse' },
          { key: 'movementType', label: 'Type', render: r => <span className={statusClass(r.movementType)}>{r.movementType}</span> },
          { key: 'quantity', label: 'Qty' },
          { key: 'referenceType', label: 'Reference' },
          { key: 'createdAt', label: 'Date', render: r => formatDate(r.createdAt || r.movementDate) },
        ]} />
      </Section>
    </div>
  );
}
