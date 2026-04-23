import { cookies } from 'next/headers'
import { adminAuth, adminDb } from '@/lib/firebase/server'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import { MessageSquare } from 'lucide-react'
import ReviewAction from '@/components/dashboard/ReviewAction'

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
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value
  if (!sessionCookie) redirect('/login')

  let user = null
  try {
    user = await adminAuth.verifySessionCookie(sessionCookie, true)
  } catch (error) {
    redirect('/login')
  }

  const requestsSnap = await adminDb.collection('requests')
    .where('client_id', '==', user.uid)
    .get()
    
  let requests = requestsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  requests.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))

  const reviewsSnap = await adminDb.collection('reviews')
    .where('client_id', '==', user.uid)
    .get()
  const reviewedRequestIds = new Set(reviewsSnap.docs.map(doc => doc.data().request_id))

  if (requests.length > 0) {
    const providerIds = [...new Set(requests.map(r => r.provider_id).filter(Boolean))]
    const providersMap = {}
    
    if (providerIds.length > 0) {
      await Promise.all(providerIds.map(async id => {
        const p = await adminDb.collection('providers').doc(id).get()
        if (p.exists) providersMap[id] = p.data()
      }))
    }
    
    const areasSnap = await adminDb.collection('areas').get()
    const areasMap = areasSnap.docs.reduce((acc, doc) => ({...acc, [doc.id]: doc.data()}), {})
    
    requests = requests.map(req => ({
      ...req,
      provider: providersMap[req.provider_id] || null,
      area: areasMap[req.area_id] || null
    }))
  }

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
                {req.status === 'completed' && req.provider_id && (
                  <ReviewAction 
                    providerId={req.provider_id} 
                    clientId={user.uid} 
                    requestId={req.id} 
                    isReviewed={reviewedRequestIds.has(req.id)}
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
