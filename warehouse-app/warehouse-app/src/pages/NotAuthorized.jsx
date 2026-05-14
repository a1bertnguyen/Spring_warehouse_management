export default function NotAuthorized() {
  return (
    <div className="page center-page">
      <div className="section-card narrow">
        <h1>Not Authorized</h1>
        <p>This frontend currently supports only <strong>PURCHASE_STAFF</strong> and <strong>WAREHOUSE_STAFF</strong> role dashboards.</p>
      </div>
    </div>
  );
}
