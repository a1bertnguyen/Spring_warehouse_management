import { useEffect, useMemo, useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import Section from '../components/Section.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { warehouseApi, unwrapArray } from '../services/api.js';
import { formatDate, statusClass } from '../utils/format.js';

const taskStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export default function WarehouseTasksPage() {
  const rawUser = localStorage.getItem('warehouse_user');
  const user = rawUser ? JSON.parse(rawUser) : null;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tasks, setTasks] = useState([]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      if (!user?.userId) {
        setTasks([]);
        return;
      }
      const res = await warehouseApi.getTasksByUser(user.userId);
      setTasks(unwrapArray(res, ['tasks']));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openTasks = useMemo(() => tasks.filter(t => !['COMPLETED', 'CANCELLED'].includes(String(t.status))).length, [tasks]);

  const updateStatus = async (id, status) => {
    await warehouseApi.updateTaskStatus(id, status);
    await loadData();
  };

  if (loading) return <LoadingState />;

  return (
    <div className="page">
      <div className="page-title">
        <div>
          <span className="eyebrow">Warehouse Staff</span>
          <h1>My Tasks</h1>
          <p>One job only: update assigned warehouse tasks. Open tasks: {openTasks}</p>
        </div>
      </div>
      <ErrorBanner message={error} />
      <Section title="My Tasks" description="Update assigned warehouse tasks." action={<button onClick={loadData}>Refresh</button>}>
        <DataTable rows={tasks} columns={[
          { key: 'taskId', label: 'ID', render: r => r.taskId || r.id },
          { key: 'productName', label: 'Product' },
          { key: 'description', label: 'Description' },
          { key: 'status', label: 'Status', render: r => <span className={statusClass(r.status)}>{r.status}</span> },
          { key: 'deadline', label: 'Deadline', render: r => formatDate(r.deadline || r.dueDate) },
          { key: 'actions', label: 'Action', render: r => <select defaultValue="" onChange={e => e.target.value && updateStatus(r.taskId || r.id, e.target.value)}><option value="">Update</option>{taskStatuses.map(s => <option key={s}>{s}</option>)}</select> },
        ]} />
      </Section>
    </div>
  );
}
