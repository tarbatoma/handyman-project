import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, Users, Briefcase, BarChart } from 'lucide-react'

export const metadata = { title: 'Admin Panel — MeșterHub' }

export default function AdminPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground text-sm">MeșterHub — Panou de administrare</p>
        </div>
        <Badge className="ml-auto">Beta</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {[
          { title: 'Utilizatori', icon: Users, value: '—', color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'Prestatori', icon: Briefcase, value: '—', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { title: 'Cereri totale', icon: BarChart, value: '—', color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardContent className="pt-6 flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Structura admin pregătită</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm mb-4">
            Pannoul de administrare este pregătit pentru extensie. Funcționalitățile planificate includ:
          </p>
          <ul className="space-y-2 text-sm">
            {[
              'Gestionare utilizatori și roluri',
              'Verificare prestatori',
              'Moderare recenzii',
              'Statistici și rapoarte',
              'Gestionare categorii',
              'Moderare cereri',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
