import { useEffect, useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import Section from '../components/Section.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { purchasingApi, unwrapArray } from '../services/api.js';

export default function SuppliersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  const [supplierForm, setSupplierForm] = useState({ name: '', contactInfo: '', address: '' });

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await purchasingApi.getSuppliers();
      setSuppliers(unwrapArray(res, ['suppliers']));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const addSupplier = async (event) => {
    event.preventDefault();
    await purchasingApi.addSupplier(supplierForm);
    setSupplierForm({ name: '', contactInfo: '', address: '' });
    await loadData();
  };

  if (loading) return <LoadingState />;

  return (
    <div className="page">
      <div className="page-title">
        <div>
          <span className="eyebrow">Purchasing Staff</span>
          <h1>Suppliers</h1>
          <p>One job only: create and view supplier profiles.</p>
        </div>
      </div>
      <ErrorBanner message={error} />
      <Section title="Suppliers" description="Create and view supplier profiles." action={<button onClick={loadData}>Refresh</button>}>
        <form className="inline-form" onSubmit={addSupplier}>
          <input placeholder="Supplier name" value={supplierForm.name} onChange={e => setSupplierForm({ ...supplierForm, name: e.target.value })} required />
          <input placeholder="Contact info" value={supplierForm.contactInfo} onChange={e => setSupplierForm({ ...supplierForm, contactInfo: e.target.value })} required />
          <input placeholder="Address" value={supplierForm.address} onChange={e => setSupplierForm({ ...supplierForm, address: e.target.value })} />
          <button>Add Supplier</button>
        </form>
        <DataTable rows={suppliers} columns={[
          { key: 'supplierId', label: 'ID', render: r => r.supplierId || r.id },
          { key: 'name', label: 'Name', render: r => r.name || r.supplierName },
          { key: 'contactInfo', label: 'Contact Info' },
          { key: 'address', label: 'Address' },
        ]} />
      </Section>
    </div>
  );
}
