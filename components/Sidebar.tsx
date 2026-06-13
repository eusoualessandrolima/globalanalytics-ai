'use client'
import { motion } from 'framer-motion'
import { BarChart3, Upload, FileText, Zap, TrendingUp, Activity, Bot, Settings } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const navItems = [
  { id: 'upload', label: 'Import Data', icon: Upload, desc: 'Upload CSV', href: '/' },
  { id: 'report', label: 'Intelligence', icon: TrendingUp, desc: 'Executive report', href: '/' },
  { id: 'anomalies', label: 'Anomalias', icon: Zap, desc: 'Detected issues', href: '/' },
]

const navItemsNew = [
  { label: 'Análise ao Vivo', icon: Bot, desc: 'IA + Meta Ads', href: '/live' },
  { label: 'Configurações', icon: Settings, desc: 'API Keys & Integrações', href: '/settings' },
]

interface SidebarProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 min-h-screen flex flex-col border-r border-white/[0.06] bg-[#020817]">
      {/* Logo */}
      <div className="p-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <BarChart3 size={18} className="text-white" />
            </div>
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 opacity-20 blur-sm -z-10" />
          </div>
          <div>
            <p className="font-bold text-sm text-white leading-tight tracking-tight">Global Analytics</p>
            <p className="text-[10px] text-blue-400/70 font-medium tracking-wider uppercase">Intelligence&trade;</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-emerald-400 text-xs font-medium">Analytics Engine Online</span>
        </div>
      </div>

      {/* Nav principal (Upload/Report/Anomalias — só na home) */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {pathname === '/' && (
          <>
            <p className="text-[10px] text-white/30 font-semibold uppercase tracking-widest px-3 py-2">Análise por Planilha</p>
            {navItems.map(({ id, label, icon: Icon, desc }) => (
              <motion.button
                key={id}
                onClick={() => onTabChange?.(id)}
                whileHover={{ x: 4 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left group ${
                  activeTab === id
                    ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                    : 'text-white/40 hover:text-white/80 hover:bg-white/[0.04]'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${activeTab === id ? 'bg-blue-500/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                  <Icon size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight">{label}</p>
                  <p className={`text-[10px] leading-tight ${activeTab === id ? 'text-blue-400/60' : 'text-white/30'}`}>{desc}</p>
                </div>
                {activeTab === id && <div className="w-1 h-4 rounded-full bg-blue-500" />}
              </motion.button>
            ))}
          </>
        )}

        <p className="text-[10px] text-white/30 font-semibold uppercase tracking-widest px-3 py-2 mt-2">Plataforma</p>

        {/* Link para home */}
        <Link href="/" className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left group ${
          pathname === '/' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' : 'text-white/40 hover:text-white/80 hover:bg-white/[0.04]'
        }`}>
          <div className={`p-1.5 rounded-lg ${pathname === '/' ? 'bg-blue-500/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
            <FileText size={15} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Dashboard</p>
            <p className="text-[10px] text-white/30">Upload & Relatórios</p>
          </div>
        </Link>

        {navItemsNew.map(({ label, icon: Icon, desc, href }) => {
          const isActive = pathname === href
          return (
            <Link key={href} href={href} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left group ${
              isActive ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' : 'text-white/40 hover:text-white/80 hover:bg-white/[0.04]'
            }`}>
              <div className={`p-1.5 rounded-lg ${isActive ? 'bg-blue-500/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                <Icon size={15} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{label}</p>
                <p className={`text-[10px] ${isActive ? 'text-blue-400/60' : 'text-white/30'}`}>{desc}</p>
              </div>
              {isActive && <div className="w-1 h-4 rounded-full bg-blue-500" />}
              {label === 'Análise ao Vivo' && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">NEW</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Activity size={12} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-medium text-white/70">Marketing Intelligence</p>
            <p className="text-[10px] text-white/30">Platform v1.0</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
