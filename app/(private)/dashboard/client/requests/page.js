import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import { MessageSquare } from 'lucide-react'

export const metadata = { title: 'Cererile mele' }

const statusColors = {
  new: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

const statusLabels = {
  new: 'Nou',
  in_progress: 'În discuție',
  completed: 'Finalizat',
  rejected: 'Respins',
}

export default async function ClientRequestsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: requests } = await supabase
    .from('requests')
    .select(`
      id, title, description, status, budget, created_at,
      provider:provider_id(business_name, slug),
      area:area_id(name)
    `)
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cererile mele</h1>
        <p className="text-muted-foreground text-sm mt-1">{requests?.length || 0} cereri trimise</p>
      </div>

      {!requests?.length ? (
        <Card>
          <CardContent className="py-16 text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-20" />
            <p className="text-muted-foreground text-sm">Nu ai trimis nicio cerere încă</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <Card key={req.id}>
              <CardContent className="pt-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-semibold">{req.title}</h3>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColors[req.status]}`}>
                        {statusLabels[req.status]}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{req.description}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      {req.provider && (
                        <a href={`/providers/${req.provider.slug}`} className="text-primary hover:underline">
                          🔧 {req.provider.business_name}
                        </a>
                      )}
                      {req.area && <span>📍 {req.area.name}</span>}
                      {req.budget && <span>💰 {req.budget} RON</span>}
                      <span>🗓️ {formatDate(req.created_at)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
