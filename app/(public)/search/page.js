import { adminDb } from '@/lib/firebase/server'
import ProviderCard from '@/components/providers/ProviderCard'
import SearchFilters from '@/components/providers/SearchFilters'
import { Skeleton } from '@/components/ui/skeleton'
import { Suspense } from 'react'
import { Search } from 'lucide-react'

export const metadata = {
  title: 'Caută meseriași',
  description: 'Caută prestatori de servicii în București după serviciu, sector sau cuvinte cheie',
}

async function SearchResults({ searchParams }) {
  const params = await searchParams
  const query = params?.q || ''
  const category = params?.category
  const area = params?.area

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

  // Client-side filtering because Firestore doesn't support ILIKE
  if (query) {
    const q = query.toLowerCase()
    providers = providers.filter(p => 
      (p.business_name && p.business_name.toLowerCase().includes(q)) ||
      (p.short_description && p.short_description.toLowerCase().includes(q))
    )
  }

  // category filter logic (if it exists)
  if (category) {
    providers = providers.filter(p => 
      p.provider_services.some(s => s.category?.slug === category)
    )
  }

  // area filter logic (if it exists)
  if (area) {
    providers = providers.filter(p => 
      p.provider_areas.some(a => a.area?.slug === area)
    )
  }

  if (params?.sort === 'rating') {
    providers.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0))
  } else {
    providers.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
  }

  providers = providers.slice(0, 24)

  return (
    <>
      <p className="text-sm text-muted-foreground mb-5">
        {providers?.length || 0} rezultate{query ? ` pentru "${query}"` : ''}
      </p>
      {!providers?.length ? (
        <div className="text-center py-16">
          <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-20" />
          <h3 className="text-lg font-semibold mb-2">Niciun rezultat</h3>
          <p className="text-muted-foreground text-sm">Încearcă alte cuvinte cheie sau filtre</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((p) => <ProviderCard key={p.id} provider={p} />)}
        </div>
      )}
    </>
  )
}

export default async function SearchPage({ searchParams }) {
  const params = await searchParams
  const query = params?.q || ''

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {query ? `Rezultate pentru "${query}"` : 'Caută prestatori'}
        </h1>
        <p className="text-muted-foreground">Caută meseriași verificați în București</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 shrink-0">
          <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
            <SearchFilters />
          </Suspense>
        </aside>
        <div className="flex-1">
          <Suspense fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="rounded-2xl border p-4 space-y-3">
                  <Skeleton className="h-40 rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
          }>
            <SearchResults searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
