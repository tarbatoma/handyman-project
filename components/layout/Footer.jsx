import Link from 'next/link'
import { Wrench, Share2, Globe, Mail } from 'lucide-react'
import { SERVICE_CATEGORIES } from '@/lib/constants'

export default function Footer() {
  const topCategories = SERVICE_CATEGORIES.slice(0, 6)

  return (
    <footer className="bg-gray-950 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Wrench className="w-4 h-4 text-white" />
              </div>
              Meșter<span className="text-primary">Hub</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Marketplace de servicii locale pentru București. Găsești rapid meseriași verificați, cu recenzii reale.
            </p>
            <div className="flex gap-3">
            {[Share2, Globe, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Servicii */}
          <div>
            <h3 className="font-semibold text-white mb-4">Servicii populare</h3>
            <ul className="space-y-2">
              {topCategories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/providers?category=${cat.slug}`}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {cat.icon} {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Linkuri */}
          <div>
            <h3 className="font-semibold text-white mb-4">Linkuri rapide</h3>
            <ul className="space-y-2">
              {[
                { href: '/providers', label: 'Toți prestatorii' },
                { href: '/search', label: 'Căutare avansată' },
                { href: '/register?type=provider', label: 'Devino prestator' },
                { href: '/login', label: 'Autentificare' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>📍 București, România</li>
              <li>
                <a href="mailto:hello@mesterhub.ro" className="hover:text-white transition-colors">
                  hello@mesterhub.ro
                </a>
              </li>
            </ul>
            <div className="mt-6">
              <Link
                href="/register?type=provider"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                Devino prestator →
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} MeșterHub. Toate drepturile rezervate.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-300 transition-colors">Politica de confidențialitate</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Termeni și condiții</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
