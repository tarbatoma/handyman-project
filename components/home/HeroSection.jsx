'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, MapPin, Star, Shield, Zap } from 'lucide-react'
import { SERVICE_CATEGORIES } from '@/lib/constants'

const stats = [
  { value: '500+', label: 'Prestatori verificați' },
  { value: '2,000+', label: 'Lucrări finalizate' },
  { value: '4.8', label: 'Rating mediu' },
]

export default function HeroSection() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e) => {
    e.preventDefault()
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  const quickCategories = SERVICE_CATEGORIES.slice(0, 4)

  return (
    <section className="hero-gradient min-h-[90vh] flex flex-col items-center justify-center relative overflow-hidden pt-16">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white rounded-full px-4 py-1.5 text-sm font-medium mb-8 animate-fade-in-up">
          <Zap className="w-3.5 h-3.5 text-yellow-400" />
          Marketplace #1 de servicii în București
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 animate-fade-in-up animation-delay-100">
          Găsește meseriașul{' '}
          <span className="gradient-text">perfect</span>{' '}
          pentru orice lucrare
        </h1>

        <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
          Zugrav, instalator, electrician, curățenie și multe altele — prestatori verificați în sectorul tău din București, cu recenzii reale.
        </p>

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-6 animate-fade-in-up animation-delay-300"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Caută un serviciu (ex: zugrav, instalator...)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 h-14 text-base bg-white/95 border-0 shadow-xl rounded-xl"
            />
          </div>
          <Button type="submit" size="lg" className="h-14 px-8 rounded-xl text-base font-semibold shadow-xl">
            <Search className="w-4 h-4 mr-2" />
            Caută
          </Button>
        </form>

        {/* Quick categories */}
        <div className="flex flex-wrap justify-center gap-2 mb-12 animate-fade-in-up animation-delay-300">
          {quickCategories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => router.push(`/providers?category=${cat.slug}`)}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full px-4 py-1.5 text-sm transition-all"
            >
              <span>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 text-white animate-fade-in-up animation-delay-300">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-white/60">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust indicators */}
      <div className="relative z-10 mt-16 w-full max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Shield, title: 'Prestatori verificați', desc: 'Fiecare prestator este evaluat înainte de listare' },
            { icon: Star, title: 'Recenzii reale', desc: 'Recenzii lăsate doar de clienți reali după lucrare' },
            { icon: MapPin, title: 'Aproape de tine', desc: 'Filtrare după sector și zonă din București' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3 bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4">
              <div className="w-9 h-9 rounded-lg bg-primary/30 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">{title}</p>
                <p className="text-white/50 text-xs mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 80L1440 80L1440 40C1200 80 960 0 720 20C480 40 240 80 0 40L0 80Z" fill="white" className="dark:fill-gray-950" />
        </svg>
      </div>
    </section>
  )
}
