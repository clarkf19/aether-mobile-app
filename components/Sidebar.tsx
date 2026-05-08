'use client'

import { Home, Map, AlertCircle, BarChart3, Zap, ClipboardList, CreditCard } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'

interface SidebarProps {
  currentView?: 'home' | 'map'
  setCurrentView?: (view: 'home' | 'map') => void
  homeHref?: string
  mapHref?: string
}

export default function Sidebar({ currentView, setCurrentView, homeHref, mapHref }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const homeLink = homeHref ?? '/student'
  const mapLink = mapHref ?? '/student?view=map'
  
  const menuItems = [
    { icon: Home, label: 'Home', id: 'home', href: homeLink, view: 'home' as const },
    { icon: Map, label: 'Map', id: 'map', href: mapLink, view: 'map' as const },
    { icon: AlertCircle, label: 'Report Issue', id: 'issues', href: '/report-issue' },
    { icon: BarChart3, label: 'Analytics', id: 'analytics', href: '/analytics' },
    { icon: Zap, label: 'AI Copilot', id: 'copilot', href: '/ai-copilot' },
    { icon: ClipboardList, label: 'Approvals', id: 'approvals', href: '/approvals' },
    { icon: CreditCard, label: 'Payments', id: 'payments', href: '/payments' },
  ]

  const isItemActive = (item: typeof menuItems[0]) => {
    // For items with view (home page views)
    if (item.view && currentView) {
      return item.view === currentView
    }
    // For standalone pages
    if (item.href && item.href !== '/' && !item.href.startsWith('/?')) {
      return pathname === item.href
    }
    // Home is active when on / with no view or home view
    if (item.id === 'home' && pathname === '/' && (!currentView || currentView === 'home')) {
      return true
    }
    return false
  }

  const handleItemClick = (item: typeof menuItems[0]) => {
    // If it's a view toggle on the home page
    if (item.view && setCurrentView && pathname === '/') {
      setCurrentView(item.view)
    } else {
      // Navigate to the page
      router.push(item.href || '/')
    }
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-black h-20 flex items-center justify-around px-2 safe-area-inset-bottom">
      {menuItems.map((item) => {
        const Icon = item.icon
        const isActive = isItemActive(item)
        
        return (
          <button
            key={item.id}
            onClick={() => handleItemClick(item)}
            className={`flex flex-col items-center justify-center gap-1 p-2 min-w-12 transition-all cursor-pointer ${
              isActive
                ? 'text-black'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title={item.label}
            type="button"
          >
            <Icon size={24} className={isActive ? 'text-yellow-500' : ''} />
            <span className={`text-xs font-bold ${isActive ? 'text-black' : 'text-gray-500'}`}>
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
