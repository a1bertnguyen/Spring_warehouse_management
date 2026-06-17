export default function DashboardCard({ title, value, hint, icon }) {
  return (
    <div className="dashboard-card">
      <div>
        <p>{title}</p>
        <h3>{value}</h3>
        {hint && <span>{hint}</span>}
      </div>
      <div className="card-icon">{icon}</div>
    </div>
  );
}
