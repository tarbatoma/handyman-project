import { createClient } from '@/lib/supabase/server'
import ProviderCard from '@/components/providers/ProviderCard'
import SearchFilters from '@/components/providers/SearchFilters'
import { Skeleton } from '@/components/ui/skeleton'
import { Suspense } from 'react'

export const metadata = {
  title: 'Toate meseriașele',
  description: 'Browsează sute de prestatori de servicii verificați în București',
}

async function ProvidersList({ searchParams }) {
  const supabase = await createClient()
  const params = await searchParams

  let query = supabase
    .from('provider_profiles')
    .select(`
      id, business_name, slug, short_description, average_rating, total_reviews,
      starting_price, is_verified, created_at,
      user:user_id(avatar_url, full_name),
      provider_services(
        title, category:category_id(name, slug, icon)
      ),
      provider_areas(area:area_id(name, slug))
    `)
    .eq('is_active', true)

  if (params?.category) {
    query = query.filter('provider_services.category.slug', 'eq', params.category)
  }
  if (params?.area) {
    query = query.filter('provider_areas.area.slug', 'eq', params.area)
  }

  const orderBy = params?.sort === 'rating' ? 'average_rating' : 'created_at'
  query = query.order(orderBy, { ascending: false })

  const { data: providers } = await query.limit(24)

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
