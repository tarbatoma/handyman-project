import { cookies } from 'next/headers'
import { adminAuth, adminDb } from '@/lib/firebase/server'
import { redirect } from 'next/navigation'
import ProviderCard from '@/components/providers/ProviderCard'
import { Heart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata = { title: 'Favorite' }

export default async function ClientFavoritesPage() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value
  if (!sessionCookie) redirect('/login')

  let user = null
  try {
    user = await adminAuth.verifySessionCookie(sessionCookie, true)
  } catch (error) {
    redirect('/login')
  }

  const favoritesSnap = await adminDb.collection('favorites')
    .where('client_id', '==', user.uid)
    .get()

  let favorites = favoritesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  favorites.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))

  if (favorites.length > 0) {
    const providerIds = [...new Set(favorites.map(f => f.provider_id))]
    const providersMap = {}
    
    if (providerIds.length > 0) {
      await Promise.all(providerIds.map(async pid => {
        const pDoc = await adminDb.collection('providers').doc(pid).get()
        if (!pDoc.exists) return
        
        const uDoc = await adminDb.collection('users').doc(pid).get()
        const userObj = uDoc.exists ? uDoc.data() : null

        const [svcsSnap, areasSnap, catsSnap, allAreasSnap] = await Promise.all([
          adminDb.collection('provider_services').where('provider_id', '==', pid).get(),
          adminDb.collection('provider_areas').where('provider_id', '==', pid).get(),
          adminDb.collection('service_categories').get(),
          adminDb.collection('areas').get()
        ])

        const catsMap = catsSnap.docs.reduce((acc, d) => ({...acc, [d.id]: d.data()}), {})
        const areasMap = allAreasSnap.docs.reduce((acc, d) => ({...acc, [d.id]: d.data()}), {})

        const provider_services = svcsSnap.docs.map(d => {
          const s = d.data()
          return { title: s.title, category: catsMap[s.category_id] || null }
        })

        const provider_areas = areasSnap.docs.map(d => {
          const a = d.data()
          return { area: areasMap[a.area_id] || null }
        })

        providersMap[pid] = {
          ...pDoc.data(),
          id: pid,
          user: userObj,
          provider_services,
          provider_areas
        }
      }))
    }
    
    favorites = favorites.map(fav => ({
      ...fav,
      provider: providersMap[fav.provider_id] || null
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Prestatori preferați</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {favorites?.length || 0} prestatori salvați
        </p>
      </div>

      {!favorites?.length ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-20" />
            <h3 className="font-semibold text-lg mb-2">Niciun prestator salvat</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Salvează prestatori preferați pentru a-i găsi rapid mai târziu
            </p>
            <Link href="/providers">
              <Button>Explorează prestatori</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {favorites.map((fav) => fav.provider && (
            <ProviderCard key={fav.id} provider={fav.provider} />
          ))}
        </div>
      )}
    </div>
  )
}
