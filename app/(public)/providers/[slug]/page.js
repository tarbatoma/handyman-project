import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Star, MapPin, BadgeCheck, Clock, Briefcase, Image } from 'lucide-react'
import { getInitials, formatDate, formatPrice } from '@/lib/utils'
import RequestForm from '@/components/forms/RequestForm'
import FavoriteButton from '@/components/providers/FavoriteButton'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('provider_profiles')
    .select('business_name, short_description')
    .eq('slug', slug)
    .single()

  if (!data) return { title: 'Prestator negăsit' }
  return {
    title: data.business_name,
    description: data.short_description,
  }
}

export default async function ProviderProfilePage({ params }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: provider } = await supabase
    .from('provider_profiles')
    .select(`
      id, business_name, slug, short_description, long_description,
      years_experience, starting_price, response_time, is_verified, is_active,
      average_rating, total_reviews, created_at,
      user:user_id(avatar_url, full_name, phone),
      provider_services(
        id, title, description, price_from, price_to, price_unit,
        category:category_id(name, slug, icon)
      ),
      provider_areas(area:area_id(name, slug)),
      provider_portfolio(id, image_url, caption),
      reviews(
        id, rating, comment, created_at,
        client:client_id(full_name, avatar_url)
      )
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!provider) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: currentProfile } = user
    ? await supabase.from('profiles').select('role, id').eq('id', user.id).single()
    : { data: null }

  const isOwnProfile = user && provider.user_id === user.id
  const rating = provider.average_rating ? Number(provider.average_rating).toFixed(1) : null
  const reviews = provider.reviews || []

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Profile info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-5">
                <Avatar className="w-24 h-24 rounded-2xl shrink-0">
                  <AvatarImage src={provider.user?.avatar_url} />
                  <AvatarFallback className="rounded-2xl bg-primary/10 text-primary text-3xl font-bold">
                    {getInitials(provider.business_name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h1 className="text-2xl font-bold">{provider.business_name}</h1>
                    {provider.is_verified && (
                      <Badge className="gap-1 bg-blue-500 hover:bg-blue-600">
                        <BadgeCheck className="w-3.5 h-3.5" /> Verificat
                      </Badge>
                    )}
                  </div>

                  {rating && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map((i) => (
                          <Star key={i} className={`w-4 h-4 ${i <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <span className="font-semibold">{rating}</span>
                      <span className="text-muted-foreground text-sm">({provider.total_reviews} recenzii)</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {provider.years_experience > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4" />
                        {provider.years_experience} ani experiență
                      </span>
                    )}
                    {provider.response_time && (
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        Răspunde {provider.response_time}
                      </span>
                    )}
                    {provider.provider_areas?.length > 0 && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {provider.provider_areas.map((a) => a.area?.name).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {provider.short_description && (
                <p className="mt-5 text-muted-foreground leading-relaxed">
                  {provider.short_description}
                </p>
              )}
            </CardContent>
          </Card>

          {/* About */}
          {provider.long_description && (
            <Card>
              <CardHeader><CardTitle className="text-base">Despre mine</CardTitle></CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {provider.long_description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Services */}
          {provider.provider_services?.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Servicii oferite</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {provider.provider_services.map((svc) => (
                  <div key={svc.id} className="border border-border rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{svc.category?.icon}</span>
                          <h4 className="font-semibold">{svc.title}</h4>
                        </div>
                        {svc.description && (
                          <p className="text-sm text-muted-foreground">{svc.description}</p>
                        )}
                      </div>
                      {svc.price_from && (
                        <div className="text-right shrink-0">
                          <div className="font-semibold text-primary">
                            {formatPrice(svc.price_from)}
                          </div>
                          {svc.price_unit && (
                            <div className="text-xs text-muted-foreground">/ {svc.price_unit}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Portfolio */}
          {provider.provider_portfolio?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Image className="w-4 h-4" /> Portofoliu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {provider.provider_portfolio.map((item) => (
                    <div key={item.id} className="aspect-square rounded-xl overflow-hidden bg-muted">
                      <img
                        src={item.image_url}
                        alt={item.caption || 'Portofoliu'}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Recenzii ({reviews.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-6">
                  Nicio recenzie încă. Fii primul care lasă o recenzie!
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border border-border rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="w-9 h-9">
                          <AvatarImage src={review.client?.avatar_url} />
                          <AvatarFallback className="text-xs bg-muted">
                            {getInitials(review.client?.full_name || 'U')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{review.client?.full_name || 'Client anonim'}</div>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map((i) => (
                                <Star key={i} className={`w-3 h-3 ${i <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(review.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column - Contact */}
        <div className="space-y-4">
          {/* Price card */}
          <Card>
            <CardContent className="pt-5">
              {provider.starting_price ? (
                <div className="text-center mb-4">
                  <div className="text-sm text-muted-foreground">Preț de pornire</div>
                  <div className="text-3xl font-bold text-primary mt-1">
                    {provider.starting_price} RON
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground text-sm mb-4">Preț negociabil</p>
              )}

              {/* Favorite + Contact */}
              <div className="space-y-2">
                {!isOwnProfile && user && currentProfile?.role === 'client' && (
                  <FavoriteButton providerId={provider.id} clientId={user.id} />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Request form */}
          {!isOwnProfile ? (
            <RequestForm providerId={provider.id} providerName={provider.business_name} />
          ) : (
            <Card>
              <CardContent className="pt-5 text-center">
                <p className="text-sm text-muted-foreground">Acesta este profilul tău public</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
