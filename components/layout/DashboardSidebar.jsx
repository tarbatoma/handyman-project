'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  User,
  Briefcase,
  MapPin,
  Image,
  MessageSquare,
  Star,
  Heart,
  Settings,
  ChevronRight,
} from 'lucide-react'

const providerLinks = [
  { href: '/dashboard/provider', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/provider/services', label: 'Servicii', icon: Briefcase },
  { href: '/dashboard/provider/areas', label: 'Zone activitate', icon: MapPin },
  { href: '/dashboard/provider/portfolio', label: 'Portofoliu', icon: Image },
  { href: '/dashboard/provider/requests', label: 'Cereri primite', icon: MessageSquare },
  { href: '/dashboard/provider/reviews', label: 'Recenzii', icon: Star },
]

const clientLinks = [
  { href: '/dashboard/client', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/client/requests', label: 'Cererile mele', icon: MessageSquare },
  { href: '/dashboard/client/favorites', label: 'Favorite', icon: Heart },
  { href: '/dashboard/client/messages', label: 'Mesaje', icon: MessageSquare },
]

const commonLinks = [
  { href: '/dashboard/profile', label: 'Profil', icon: User },
  { href: '/dashboard/settings', label: 'Setări', icon: Settings },
]

export default function DashboardSidebar({ role }) {
  const pathname = usePathname()
  const roleLinks = role === 'provider' ? providerLinks : clientLinks
  const roleLabel = role === 'provider' ? 'Prestator' : 'Client'

  return (
    <aside className="w-64 shrink-0">
      <div className="sticky top-20">
        {/* Role badge */}
        <div className="mb-6 px-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            {roleLabel}
          </span>
        </div>

        <nav className="space-y-1">
          {roleLinks.map((link) => (
            <SidebarLink key={link.href} link={link} pathname={pathname} />
          ))}

          <div className="my-4 border-t border-border" />

          {commonLinks.map((link) => (
            <SidebarLink key={link.href} link={link} pathname={pathname} />
          ))}
        </nav>
      </div>
    </aside>
  )
}

function SidebarLink({ link, pathname }) {
  const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
  const Icon = link.icon

  return (
    <Link
      href={link.href}
      className={cn(
        'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
        isActive
          ? 'bg-primary text-white shadow-sm'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="flex-1">{link.label}</span>
      {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
    </Link>
  )
}
