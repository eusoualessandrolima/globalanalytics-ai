'use client'
import { BarChart3, Upload, FileText, Zap } from 'lucide-react'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navItems = [
  { id: 'upload', label: 'Upload CSV', icon: Upload },
  { id: 'report', label: 'Relatório', icon: FileText },
  { id: 'anomalies', label: 'Anomalias', icon: Zap },
]

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="w-64 min-h-screen bg-secondary border-r border-white/10 flex flex-col">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <BarChart3 className="text-accent" size={28} />
          <div>
            <h1 className="font-bold text-lg leading-tight">GlobalAnalytics</h1>
            <span className="text-accent text-sm font-medium">AI</span>
          </div>
        </div>
        <p className="text-white/50 text-xs mt-2">Meta Ads Intelligence</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left text-sm font-medium ${
              activeTab === id
                ? 'bg-accent text-white'
                : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10">
        <p className="text-white/30 text-xs text-center">
          Powered by Claude AI
        </p>
      </div>
    </aside>
  )
}
