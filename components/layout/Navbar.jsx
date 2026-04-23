'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { auth } from '@/lib/firebase/client'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { removeSession } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
import { Wrench, Menu, X, LogOut, User, LayoutDashboard, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'

export default function Navbar() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        // TODO: Firestore fetch profile
        setProfile({ full_name: currentUser.displayName || currentUser.email })
      } else {
        setProfile(null)
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = async () => {
    await signOut(auth)
    await removeSession()
    toast.success('Ai fost deconectat')
    router.push('/')
    router.refresh()
  }

  const isHome = pathname === '/'
  const navBg = isHome
    ? scrolled
      ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm'
      : 'bg-transparent'
    : 'bg-white dark:bg-gray-900 border-b border-border'

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <span className={isHome && !scrolled ? 'text-white' : 'text-foreground'}>
              Meșter<span className="text-primary">Hub</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/providers"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isHome && !scrolled ? 'text-white/80 hover:text-white' : 'text-muted-foreground'
              }`}
            >
              Prestatori
            </Link>
            <Link
              href="/search"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isHome && !scrolled ? 'text-white/80 hover:text-white' : 'text-muted-foreground'
              }`}
            >
              Cautare
            </Link>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 rounded-full p-1 hover:bg-accent transition-colors outline-none">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="text-xs bg-primary text-white">
                      {getInitials(profile?.full_name || user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <span className={`text-sm font-medium hidden sm:block ${isHome && !scrolled ? 'text-white' : ''}`}>
                    {profile?.full_name?.split(' ')[0] || 'Contul meu'}
                  </span>
                  <ChevronDown className={`w-4 h-4 ${isHome && !scrolled ? 'text-white/70' : 'text-muted-foreground'}`} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <Link href="/dashboard" className="w-full">
                    <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/dashboard/profile" className="w-full">
                    <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                      <User className="w-4 h-4" />
                      Profilul meu
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-destructive focus:text-destructive"
                  >
                    <LogOut className="w-4 h-4" />
                    Deconectare
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={isHome && !scrolled ? 'text-white hover:text-white hover:bg-white/20' : ''}
                  >
                    Autentificare
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Înregistrare</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className={`md:hidden p-2 rounded-lg transition-colors ${
              isHome && !scrolled ? 'text-white hover:bg-white/20' : 'hover:bg-accent'
            }`}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t border-border py-4 px-4 space-y-3">
            <Link href="/providers" className="block text-sm font-medium py-2 hover:text-primary" onClick={() => setMobileOpen(false)}>
              Prestatori
            </Link>
            <Link href="/search" className="block text-sm font-medium py-2 hover:text-primary" onClick={() => setMobileOpen(false)}>
              Căutare
            </Link>
            <div className="pt-2 border-t border-border space-y-2">
              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-destructive" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4" /> Deconectare
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">Autentificare</Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)}>
                    <Button size="sm" className="w-full">Înregistrare</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
