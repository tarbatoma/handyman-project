import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials, formatDate } from '@/lib/utils'

export const metadata = { title: 'Recenziile mele' }

export default async function ProviderReviewsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: providerProfile } = await supabase
    .from('provider_profiles')
    .select('id, average_rating, total_reviews')
    .eq('user_id', user.id)
    .single()

  if (!providerProfile) redirect('/dashboard/provider')

  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, rating, comment, created_at, client:client_id(full_name, avatar_url)')
    .eq('provider_id', providerProfile.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Recenziile mele</h1>
        <p className="text-muted-foreground text-sm mt-1">{providerProfile.total_reviews} recenzii totale</p>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 rounded-2xl border border-yellow-200/50 p-6">
        <div className="flex items-center gap-4">
          <div className="text-5xl font-bold text-yellow-500">
            {providerProfile.average_rating ? Number(providerProfile.average_rating).toFixed(1) : '—'}
          </div>
          <div>
            <div className="flex gap-0.5 mb-1">
              {[1,2,3,4,5].map((i) => (
                <Star key={i} className={`w-5 h-5 ${i <= Math.round(providerProfile.average_rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{providerProfile.total_reviews} recenzii</p>
          </div>
        </div>
      </div>

      {/* Reviews list */}
      {!reviews?.length ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-20" />
            <p className="text-muted-foreground text-sm">Nicio recenzie încă</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <Card key={rev.id}>
              <CardContent className="pt-5">
                <div className="flex items-start gap-4">
                  <Avatar className="w-10 h-10 shrink-0">
                    <AvatarImage src={rev.client?.avatar_url} />
                    <AvatarFallback className="text-sm bg-muted">
                      {getInitials(rev.client?.full_name || 'C')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium text-sm">{rev.client?.full_name || 'Client anonim'}</span>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map((i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i <= rev.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">{formatDate(rev.created_at)}</span>
                    </div>
                    {rev.comment && <p className="text-sm text-muted-foreground">{rev.comment}</p>}
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
