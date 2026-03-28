interface Column {
  header: string
  accessor?: string
  render?: (row: any) => React.ReactNode
  width?: string
}

interface TableProps {
  columns: Column[]
  data: any[]
  onRowClick?: (row: any) => void
  emptyMessage?: string
}

export function Table({ columns, data, onRowClick, emptyMessage = 'Nenhum registro encontrado' }: TableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            {columns.map((col, i) => (
              <th 
                key={i} 
                className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {data.map((row, rowIndex) => (
            <tr 
              key={rowIndex}
              onClick={() => onRowClick?.(row)}
              className={`
                hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors
                ${onRowClick ? 'cursor-pointer' : ''}
              `}
            >
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
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
