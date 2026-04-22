import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { MessageSquare, Star, Briefcase, MapPin, Image, TrendingUp, ArrowRight } from 'lucide-react'

export const metadata = { title: 'Dashboard Prestator' }

export default async function ProviderDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'provider') redirect('/dashboard/client')

  const { data: providerProfile } = await supabase
    .from('provider_profiles')
    .select(`
      id, business_name, slug, average_rating, total_reviews, is_active,
      provider_services(count),
      provider_areas(count)
    `)
    .eq('user_id', user.id)
    .single()

  let requestStats = { total: 0, new: 0 }
  if (providerProfile) {
    const { data: requests } = await supabase
      .from('requests')
      .select('status')
      .eq('provider_id', providerProfile.id)
    requestStats.total = requests?.length || 0
    requestStats.new = requests?.filter((r) => r.status === 'new').length || 0
  }

  const stats = [
    {
      title: 'Cereri primite',
      value: requestStats.total,
      sub: `${requestStats.new} noi`,
      icon: MessageSquare,
      href: '/dashboard/provider/requests',
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      title: 'Servicii active',
      value: providerProfile?.provider_services?.[0]?.count || 0,
      sub: 'servicii listate',
      icon: Briefcase,
      href: '/dashboard/provider/services',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
      title: 'Rating mediu',
      value: providerProfile?.average_rating
        ? Number(providerProfile.average_rating).toFixed(1)
        : '—',
      sub: `${providerProfile?.total_reviews || 0} recenzii`,
      icon: Star,
      href: '/dashboard/provider/reviews',
      color: 'text-yellow-600',
      bg: 'bg-yellow-50 dark:bg-yellow-950/30',
    },
    {
      title: 'Zone acoperite',
      value: providerProfile?.provider_areas?.[0]?.count || 0,
      sub: 'sectoare',
      icon: MapPin,
      href: '/dashboard/provider/areas',
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-950/30',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Bun venit, {profile?.full_name?.split(' ')[0] || 'Prestator'}! 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Iată un rezumat al activității tale
          </p>
        </div>
        {providerProfile?.slug && (
          <Link href={`/providers/${providerProfile.slug}`} target="_blank">
            <Button variant="outline" size="sm" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Vezi profilul public
            </Button>
          </Link>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="card-hover cursor-pointer border-border/60">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Acțiuni rapide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { href: '/dashboard/provider/services', label: 'Adaugă un serviciu nou', icon: Briefcase },
              { href: '/dashboard/provider/portfolio', label: 'Încarcă poze în portofoliu', icon: Image },
              { href: '/dashboard/provider/areas', label: 'Actualizează zonele de activitate', icon: MapPin },
              { href: '/dashboard/provider/requests', label: 'Vezi cererile noi', icon: MessageSquare },
            ].map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors group"
                >
                  <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                  <span className="text-sm flex-1">{action.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {providerProfile ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Profil activ</span>
                  <Badge variant={providerProfile.is_active ? 'default' : 'secondary'}>
                    {providerProfile.is_active ? 'Activ' : 'Inactiv'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Verificat</span>
                  <Badge variant={providerProfile.is_verified ? 'default' : 'outline'}>
                    {providerProfile.is_verified ? '✓ Verificat' : 'Neverificat'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Servicii</span>
                  <span className="text-sm font-medium">
                    {providerProfile.provider_services?.[0]?.count || 0} listare(i)
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-3">Profilul de prestator nu e complet</p>
                <Link href="/dashboard/provider">
                  <Button size="sm">Completează profilul</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
