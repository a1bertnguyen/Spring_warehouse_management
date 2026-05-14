export default function DataTable({ columns, rows, emptyText = 'No data found' }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{columns.map(col => <th key={col.key}>{col.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={columns.length} className="empty-cell">{emptyText}</td></tr>
          ) : rows.map((row, index) => (
            <tr key={row.id || row.stockInwardId || row.stockTakeId || row.productId || index}>
              {columns.map(col => <td key={col.key}>{col.render ? col.render(row) : row[col.key] ?? '-'}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
