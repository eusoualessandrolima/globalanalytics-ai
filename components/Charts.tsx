'use client'
import { useMemo } from 'react'
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts'
import { motion } from 'framer-motion'
import type { CampaignRow, AnalysisReport } from '@/types/campaign'

interface ChartsProps {
  rows: CampaignRow[]
  report: AnalysisReport
}

const tooltipStyle = {
  backgroundColor: 'rgba(15,23,42,0.95)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '10px',
  color: '#F8FAFC',
  fontSize: '12px',
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-xl p-5">
      <p className="text-sm font-semibold text-white/70 mb-4">{title}</p>
      {children}
    </div>
  )
}

export default function Charts({ rows, report }: ChartsProps) {
  // Memoizar agregações pesadas: o componente re-renderiza em hover/animação
  // dos cards vizinhos; sem useMemo, todos esses reduce/sort rodariam em cada render.
  const roasByCampaign = useMemo(
    () =>
      Object.entries(
        rows.reduce((acc, r) => {
          if (!acc[r.campanha]) acc[r.campanha] = { sum: 0, count: 0 }
          acc[r.campanha].sum += r.ROAS
          acc[r.campanha].count += 1
          return acc
        }, {} as Record<string, { sum: number; count: number }>)
      )
        .map(([name, { sum, count }]) => ({
          name: name.slice(0, 18),
          roas: parseFloat((sum / count).toFixed(2)),
        }))
        .sort((a, b) => b.roas - a.roas)
        .slice(0, 6),
    [rows]
  )

  const spendByCampaign = useMemo(
    () =>
      Object.entries(
        rows.reduce((acc, r) => {
          if (!acc[r.campanha]) acc[r.campanha] = 0
          acc[r.campanha] += r.gasto
          return acc
        }, {} as Record<string, number>)
      )
        .map(([name, value]) => ({ name: name.slice(0, 18), value: parseFloat(value.toFixed(2)) }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5),
    [rows]
  )

  const severityDist = useMemo(
    () =>
      [
        { name: 'Alta', value: report.anomalias.filter(a => a.severidade === 'alta').length, color: '#EF4444' },
        { name: 'Média', value: report.anomalias.filter(a => a.severidade === 'media').length, color: '#F59E0B' },
        { name: 'Baixa', value: report.anomalias.filter(a => a.severidade === 'baixa').length, color: '#10B981' },
      ].filter(d => d.value > 0),
    [report.anomalias]
  )

  const ctrByDate = useMemo(
    () =>
      Object.entries(
        rows.reduce((acc, r) => {
          if (!acc[r.data]) acc[r.data] = { sum: 0, count: 0 }
          acc[r.data].sum += r.CTR
          acc[r.data].count += 1
          return acc
        }, {} as Record<string, { sum: number; count: number }>)
      )
        .map(([date, { sum, count }]) => ({ date: date.slice(5), ctr: parseFloat((sum / count).toFixed(2)) }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-14),
    [rows]
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <ChartCard title="ROAS por Campanha">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={roasByCampaign} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="roas" fill="#3B82F6" radius={[4, 4, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <ChartCard title="CTR ao Longo do Tempo">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={ctrByDate} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="ctr" stroke="#60A5FA" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <ChartCard title="Investimento por Campanha">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={spendByCampaign} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} width={90} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => [`R$${Number(v).toFixed(0)}`, 'Gasto']} />
              <Bar dataKey="value" fill="#8B5CF6" radius={[0, 4, 4, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </motion.div>

      {severityDist.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <ChartCard title="Distribuição de Anomalias">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={severityDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {severityDist.map((entry, index) => (
                    <Cell key={index} fill={entry.color} opacity={0.85} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" iconSize={8} formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </motion.div>
      )}
    </div>
  )
}
