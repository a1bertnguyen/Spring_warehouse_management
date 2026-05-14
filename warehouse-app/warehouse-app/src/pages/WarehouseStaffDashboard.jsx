import { useEffect, useMemo, useState } from 'react';
import { ClipboardCheck, ListTodo, Repeat2, Truck } from 'lucide-react';
import DashboardCard from '../components/DashboardCard.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { warehouseApi, unwrapArray } from '../services/api.js';

export default function WarehouseStaffDashboard() {
  const rawUser = localStorage.getItem('warehouse_user');
  const user = rawUser ? JSON.parse(rawUser) : null;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stockInwards, setStockInwards] = useState([]);
  const [stockTakes, setStockTakes] = useState([]);
  const [movements, setMovements] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError('');
      try {
        const calls = [
          warehouseApi.getStockInwards(),
          warehouseApi.getStockTakes(),
          warehouseApi.getInventoryMovements(),
        ];
        if (user?.userId) calls.push(warehouseApi.getTasksByUser(user.userId));
        const [inwardRes, takeRes, movementRes, taskRes] = await Promise.all(calls);
        setStockInwards(unwrapArray(inwardRes, ['stockInwards']));
        setStockTakes(unwrapArray(takeRes, ['stockTakes']));
        setMovements(unwrapArray(movementRes, ['inventoryMovements', 'movements']));
        setTasks(taskRes ? unwrapArray(taskRes, ['tasks']) : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const openTasks = useMemo(() => tasks.filter(t => !['COMPLETED', 'CANCELLED'].includes(String(t.status))).length, [tasks]);

  if (loading) return <LoadingState />;

  return (
    <div className="page">
      <div className="page-title">
        <div>
          <span className="eyebrow">Warehouse Staff</span>
          <h1>Dashboard</h1>
          <p>This page only shows warehouse summary. Use the sidebar to work with stock inward, stock take, movements, or tasks.</p>
        </div>
      </div>

      <ErrorBanner message={error} />

      <div className="cards-grid">
        <DashboardCard title="Stock Inwards" value={stockInwards.length} hint="Incoming stock" icon={<Truck size={24} />} />
        <DashboardCard title="Stock Takes" value={stockTakes.length} hint="Counting sessions" icon={<ClipboardCheck size={24} />} />
        <DashboardCard title="Movements" value={movements.length} hint="Inventory logs" icon={<Repeat2 size={24} />} />
        <DashboardCard title="My Tasks" value={tasks.length} hint={`${openTasks} open tasks`} icon={<ListTodo size={24} />} />
      </div>
    </div>
  );
}
