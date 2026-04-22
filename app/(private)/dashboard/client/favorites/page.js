import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProviderCard from '@/components/providers/ProviderCard'
import { Heart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata = { title: 'Favorite' }

export default async function ClientFavoritesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: favorites } = await supabase
    .from('favorites')
    .select(`
      id, created_at,
      provider:provider_id(
        id, business_name, slug, short_description, average_rating, total_reviews,
        starting_price, is_verified,
        user:user_id(avatar_url),
        provider_services(title, category:category_id(name, slug, icon)),
        provider_areas(area:area_id(name, slug))
      )
    `)
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })

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
