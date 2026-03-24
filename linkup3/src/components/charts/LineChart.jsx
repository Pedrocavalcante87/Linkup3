import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useSync } from '../../contexts/SyncContext'

export default function ChartLine() {
  const { snapshot } = useSync()
  const monthlyData = useMemo(() => {
    const faturas = snapshot?.finance?.faturas || []
    const agg = {}
    faturas.forEach(f => {
      const dt = new Date(f.vencimento || f.emissao || f.dataVencimento)
      if (Number.isNaN(dt.getTime())) return
      const label = dt.toLocaleString('pt-BR', { month: 'short' })
      const idx = dt.getMonth()
      if (!agg[label]) {
        agg[label] = { month: label, value: 0, idx }
      }
      agg[label].value += Number(f.valor || 0)
    })
    return Object.values(agg).sort((a, b) => a.idx - b.idx)
  }, [snapshot])

  return (
    <div
      className="rounded-xl p-6 transition-all"
      style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
    >
      <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Evolução dos lançamentos</h3>
      <div style={{ width: '100%', height: 250 }}>
        <ResponsiveContainer>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="month"
              tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
              tickLine={{ stroke: 'var(--color-border)' }}
              axisLine={{ stroke: 'var(--color-border)' }}
            />
            <YAxis
              tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
              tickLine={{ stroke: 'var(--color-border)' }}
              axisLine={{ stroke: 'var(--color-border)' }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', boxShadow: 'var(--shadow-card)' }}
              labelStyle={{ color: 'var(--color-text-secondary)' }}
              itemStyle={{ color: 'var(--color-text-primary)' }}
            />
            <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={3} dot={{ r:3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
