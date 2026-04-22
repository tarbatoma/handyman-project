import { createClient } from '@/lib/supabase/server'
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
  const supabase = await createClient()
  const params = await searchParams
  const query = params?.q || ''
  const category = params?.category
  const area = params?.area

  let dbQuery = supabase
    .from('provider_profiles')
    .select(`
      id, business_name, slug, short_description, average_rating, total_reviews,
      starting_price, is_verified,
      user:user_id(avatar_url),
      provider_services(title, category:category_id(name, slug, icon)),
      provider_areas(area:area_id(name, slug))
    `)
    .eq('is_active', true)

  if (query) {
    dbQuery = dbQuery.or(
      `business_name.ilike.%${query}%,short_description.ilike.%${query}%`
    )
  }

  if (params?.sort === 'rating') {
    dbQuery = dbQuery.order('average_rating', { ascending: false })
  } else {
    dbQuery = dbQuery.order('created_at', { ascending: false })
  }

  const { data: providers } = await dbQuery.limit(24)

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
