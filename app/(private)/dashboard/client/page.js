import { cookies } from 'next/headers'
import { adminAuth, adminDb } from '@/lib/firebase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { MessageSquare, Heart, Star, Search } from 'lucide-react'

export const metadata = { title: 'Dashboard Client' }

export default async function ClientDashboardPage() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value
  if (!sessionCookie) redirect('/login')

  let user = null
  try {
    user = await adminAuth.verifySessionCookie(sessionCookie, true)
  } catch (error) {
    redirect('/login')
  }

  const userDoc = await adminDb.collection('users').doc(user.uid).get()
  const profile = userDoc.data()

  if (profile?.role === 'provider') redirect('/dashboard/provider')

  const [requestsSnap, favoritesSnap] = await Promise.all([
    adminDb.collection('requests').where('client_id', '==', user.uid).get(),
    adminDb.collection('favorites').where('client_id', '==', user.uid).get()
  ])

  const requests = requestsSnap.docs.map(doc => doc.data())
  const favorites = favoritesSnap.docs.map(doc => doc.data())

  const stats = [
    {
      title: 'Cereri trimise',
      value: requests?.length || 0,
      sub: `${requests?.filter((r) => r.status === 'new').length || 0} în așteptare`,
      icon: MessageSquare,
      href: '/dashboard/client/requests',
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      title: 'Prestatori preferați',
      value: favorites?.length || 0,
      sub: 'salvați la favorite',
      icon: Heart,
      href: '/dashboard/client/favorites',
      color: 'text-rose-600',
      bg: 'bg-rose-50 dark:bg-rose-950/30',
    },
    {
      title: 'Lucrări finalizate',
      value: requests?.filter((r) => r.status === 'completed').length || 0,
      sub: 'lucrări realizate',
      icon: Star,
      href: '/dashboard/client/requests',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          Bun venit, {profile?.full_name?.split(' ')[0] || 'Utilizator'}! 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Găsește rapid meseriașul de care ai nevoie
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="card-hover cursor-pointer border-border/60">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold mt-1">{stat.value}</p>
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

      {/* CTA - Cauta un meserias */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">Găsește un meseriaș acum</h3>
            <p className="text-muted-foreground text-sm">
              Browsează sute de prestatori verificați în București
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link href="/search">
              <Button size="sm" className="gap-2">
                <Search className="w-4 h-4" />
                Caută meseriaș
              </Button>
            </Link>
            <Link href="/providers">
              <Button size="sm" variant="outline">
                Toți prestatorii
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Cereri recente */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Cererile mele recente</CardTitle>
            <Link href="/dashboard/client/requests">
              <Button variant="ghost" size="sm">Vezi toate →</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {!requests?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Nu ai trimis nicio cerere încă</p>
              <Link href="/providers" className="text-primary text-sm hover:underline mt-2 inline-block">
                Caută un prestator
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {requests.slice(0, 3).map((req, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm flex-1">Cerere #{i + 1}</span>
                  <Badge variant="outline" className="text-xs capitalize">{req.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
