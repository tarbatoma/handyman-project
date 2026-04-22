import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import { MessageSquare } from 'lucide-react'
import UpdateRequestStatus from '@/components/dashboard/UpdateRequestStatus'

export const metadata = { title: 'Cereri primite' }

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

export default async function ProviderRequestsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: providerProfile } = await supabase
    .from('provider_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!providerProfile) redirect('/dashboard/provider')

  const { data: requests } = await supabase
    .from('requests')
    .select(`
      id, title, description, status, budget, client_phone, created_at,
      client:client_id(full_name, phone, avatar_url),
      area:area_id(name)
    `)
    .eq('provider_id', providerProfile.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cereri primite</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {requests?.length || 0} cereri în total
        </p>
      </div>

      {!requests?.length ? (
        <Card>
          <CardContent className="py-16 text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-20" />
            <h3 className="font-semibold text-lg mb-2">Nicio cerere primită</h3>
            <p className="text-muted-foreground text-sm">
              Când un client îți trimite o cerere, apare aici
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <Card key={req.id}>
              <CardContent className="pt-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-semibold">{req.title}</h3>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColors[req.status]}`}>
                        {statusLabels[req.status]}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{req.description}</p>

                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span>👤 {req.client?.full_name || 'Anonim'}</span>
                      {req.area && <span>📍 {req.area.name}</span>}
                      {req.budget && <span>💰 {req.budget} RON</span>}
                      {(req.client_phone || req.client?.phone) && (
                        <span>📞 {req.client_phone || req.client?.phone}</span>
                      )}
                      <span>🗓️ {formatDate(req.created_at)}</span>
                    </div>
                  </div>

                  <UpdateRequestStatus requestId={req.id} currentStatus={req.status} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
