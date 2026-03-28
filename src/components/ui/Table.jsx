export function Table({ columns, data, onRowClick, emptyMessage = 'Nenhum registro encontrado' }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-surface-500">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-surface-200">
            {columns.map((col, i) => (
              <th 
                key={i} 
                className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider"
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-100">
          {data.map((row, rowIndex) => (
            <tr 
              key={rowIndex}
              onClick={() => onRowClick?.(row)}
              className={`
                hover:bg-surface-50 transition-colors
                ${onRowClick ? 'cursor-pointer' : ''}
              `}
            >
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="px-4 py-3 text-sm text-surface-700">
                  {col.render ? col.render(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
