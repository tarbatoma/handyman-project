import { adminDb } from '@/lib/firebase/server'
import ProviderCard from '@/components/providers/ProviderCard'
import SearchFilters from '@/components/providers/SearchFilters'
import { Skeleton } from '@/components/ui/skeleton'
import { Suspense } from 'react'

export const metadata = {
  title: 'Toate meseriașele',
  description: 'Browsează sute de prestatori de servicii verificați în București',
}

async function ProvidersList({ searchParams }) {
  const params = await searchParams

  let providersQuery = adminDb.collection('providers').where('is_active', '==', true)
  const providersSnap = await providersQuery.get()
  let providers = providersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))

  if (providers.length > 0) {
    const [usersSnap, svcsSnap, areasSnap, catsSnap, allAreasSnap] = await Promise.all([
      adminDb.collection('users').get(),
      adminDb.collection('provider_services').get(),
      adminDb.collection('provider_areas').get(),
      adminDb.collection('service_categories').get(),
      adminDb.collection('areas').get()
    ])

    const usersMap = usersSnap.docs.reduce((acc, d) => ({...acc, [d.id]: d.data()}), {})
    const catsMap = catsSnap.docs.reduce((acc, d) => ({...acc, [d.id]: d.data()}), {})
    const areasMap = allAreasSnap.docs.reduce((acc, d) => ({...acc, [d.id]: d.data()}), {})

    // group services by provider
    const servicesByProvider = {}
    svcsSnap.docs.forEach(d => {
      const s = d.data()
      if (!servicesByProvider[s.provider_id]) servicesByProvider[s.provider_id] = []
      servicesByProvider[s.provider_id].push({ title: s.title, category: catsMap[s.category_id] || null })
    })

    // group areas by provider
    const areasByProvider = {}
    areasSnap.docs.forEach(d => {
      const a = d.data()
      if (!areasByProvider[a.provider_id]) areasByProvider[a.provider_id] = []
      areasByProvider[a.provider_id].push({ area: areasMap[a.area_id] || null })
    })

    providers = providers.map(p => ({
      ...p,
      user: usersMap[p.id] || null,
      provider_services: servicesByProvider[p.id] || [],
      provider_areas: areasByProvider[p.id] || []
    }))
  }

  if (params?.category) {
    providers = providers.filter(p => p.provider_services.some(s => s.category?.slug === params.category))
  }
  
  if (params?.area) {
    providers = providers.filter(p => p.provider_areas.some(a => a.area?.slug === params.area))
  }

  if (params?.sort === 'rating') {
    providers.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0))
  } else {
    providers.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
  }

  providers = providers.slice(0, 24)

  if (!providers?.length) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-4">🔍</p>
        <h3 className="text-lg font-semibold mb-2">Niciun prestator găsit</h3>
        <p className="text-muted-foreground text-sm">Încearcă alte filtre sau caută alte categorii</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {providers.map((provider) => (
        <ProviderCard key={provider.id} provider={provider} />
      ))}
    </div>
  )
}

export default async function ProvidersPage({ searchParams }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Prestatori de servicii</h1>
        <p className="text-muted-foreground">Găsește meseriași verificați în sectorul tău din București</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
            <SearchFilters />
          </Suspense>
        </aside>

        {/* Results */}
        <div className="flex-1">
          <Suspense
            fallback={
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-border p-4 space-y-3">
                    <Skeleton className="h-40 rounded-xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            }
          >
            <ProvidersList searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
