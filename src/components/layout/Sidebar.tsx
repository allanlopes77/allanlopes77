'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { href: '/suggestions', label: 'Sugestões', icon: '💬' },
  { href: '/clients', label: 'Clientes', icon: '👥' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 bg-surface-800 border-r border-surface-700 flex flex-col">
      <div className="px-5 py-5 border-b border-surface-700">
        <span className="text-brand-400 font-bold text-lg tracking-tight">ClienteIA</span>
        <p className="text-xs text-gray-500 mt-0.5">AI Account Manager</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map((item) => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-brand-600/20 text-brand-400'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-surface-700'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-5 py-4 border-t border-surface-700">
        <p className="text-xs text-gray-600">MVP v0.1</p>
      </div>
    </aside>
  )
}
