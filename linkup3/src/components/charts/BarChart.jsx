import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useSync } from '../../contexts/SyncContext'

export default function ChartBar() {
  const { snapshot } = useSync()
  const byEmpresa = useMemo(() => {
    const faturas = snapshot?.finance?.faturas || []
    const empresas = snapshot?.empresas || []
    const nomes = Object.fromEntries(empresas.map(e => [e.id, e.nome]))
    const agg = {}
    faturas.forEach(f => {
      const key = f.empresa_id || f.empresa || 'desconhecida'
      if (!agg[key]) {
        agg[key] = { name: nomes[key] || key, value: 0 }
      }
      agg[key].value += Number(f.valor || 0)
    })
    return Object.values(agg)
  }, [snapshot])

  return (
    <div
      className="rounded-xl p-6 transition-all"
      style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
    >
      <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Lançamentos por unidade</h3>
      <div style={{ width: '100%', height: 250 }}>
        <ResponsiveContainer>
          <BarChart data={byEmpresa}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="name"
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
            <Bar dataKey="value" fill="var(--primary)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
