import clsx from "clsx";
import { Skeleton } from "./Skeleton";
import { Inbox } from "lucide-react";

/**
 * Table - Componente de tabela com skeleton, empty state e acessibilidade
 * @param {Array} columns - Array de strings com títulos das colunas
 * @param {Array} rows - Array de arrays com dados das linhas
 * @param {boolean} loading - Estado de carregamento
 * @param {string} size - "compact" | "normal" | "comfortable"
 * @param {string} emptyMessage - Mensagem quando não há dados
 */
export default function Table({ 
  columns, 
  rows, 
  loading = false,
  size = "normal",
  emptyMessage = "Nenhum dado disponível",
  className
}) {
  const sizes = {
    compact: "px-4 py-2",
    normal: "px-6 py-4",
    comfortable: "px-8 py-6",
  };

  const cellPadding = sizes[size];

  // Loading skeleton
  if (loading) {
    return (
      <div className={clsx("overflow-x-auto rounded-xl", className)} style={{ border: '1px solid var(--color-border)' }}>
        <table className="min-w-full text-sm" role="table" aria-busy="true">
          <thead style={{ backgroundColor: 'var(--color-border-light)', borderBottom: '2px solid var(--color-border)' }}>
            <tr>
              {columns.map((col, i) => (
                <th
                  key={i}
                  className={clsx(cellPadding, "text-left font-semibold")}
                  style={{ color: 'var(--color-text-secondary)' }}
                  scope="col"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={{ backgroundColor: 'var(--color-card)', borderTop: '1px solid var(--color-border)' }}>
            {[...Array(5)].map((_, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                {columns.map((_, j) => (
                  <td key={j} className={cellPadding}>
                    <Skeleton variant="text" width={`${60 + Math.random() * 30}%`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Empty state
  if (!rows || rows.length === 0) {
    return (
      <div className={clsx("rounded-xl", className)} style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card)' }}>
        <table className="min-w-full text-sm" role="table">
          <thead style={{ backgroundColor: 'var(--color-border-light)', borderBottom: '2px solid var(--color-border)' }}>
            <tr>
              {columns.map((col, i) => (
                <th
                  key={i}
                  className={clsx(cellPadding, "text-left font-semibold")}
                  style={{ color: 'var(--color-text-secondary)' }}
                  scope="col"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
        </table>
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full mb-4" style={{ backgroundColor: 'var(--color-border-light)' }}>
            <Inbox className="h-8 w-8" style={{ color: 'var(--color-text-muted)' }} aria-hidden="true" />
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>{emptyMessage}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Os dados aparecerão aqui quando disponíveis</p>
        </div>
      </div>
    );
  }

  // Normal table
  return (
    <div className={clsx("overflow-x-auto rounded-xl", className)} style={{ border: '1px solid var(--color-border)' }}>
      <table className="min-w-full text-sm" role="table">
        <thead style={{ backgroundColor: 'var(--color-border-light)', borderBottom: '2px solid var(--color-border)' }}>
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                className={clsx(
                  cellPadding,
                  "text-left font-semibold"
                )}
                style={{ color: 'var(--color-text-secondary)' }}
                scope="col"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody style={{ backgroundColor: 'var(--color-card)' }}>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="transition-colors"
              style={{ borderBottom: '1px solid var(--color-border)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-border-light)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              onFocus={(e) => e.currentTarget.style.backgroundColor = 'var(--color-border-light)'}
              onBlur={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              tabIndex={0}
            >
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={clsx(cellPadding)}
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
