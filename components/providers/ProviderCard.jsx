'use client'

import Link from 'next/link'
import { Star, MapPin, BadgeCheck, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials, formatPrice } from '@/lib/utils'

export default function ProviderCard({ provider }) {
  const services = provider.provider_services?.slice(0, 2) || []
  const areas = provider.provider_areas?.slice(0, 2) || []
  const rating = provider.average_rating ? Number(provider.average_rating).toFixed(1) : null

  return (
    <Link href={`/providers/${provider.slug}`}>
      <div className="group rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-200 overflow-hidden card-hover h-full flex flex-col">
        {/* Header */}
        <div className="p-5 flex-1">
          <div className="flex items-start gap-4 mb-4">
            <Avatar className="w-14 h-14 rounded-xl shrink-0">
              <AvatarImage src={provider.user?.avatar_url} />
              <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-semibold text-lg">
                {getInitials(provider.business_name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <h3 className="font-semibold text-foreground truncate">
                  {provider.business_name}
                </h3>
                {provider.is_verified && (
                  <BadgeCheck className="w-4 h-4 text-blue-500 shrink-0" />
                )}
              </div>

              {/* Rating */}
              {rating ? (
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold">{rating}</span>
                  <span className="text-xs text-muted-foreground">
                    ({provider.total_reviews} recenzii)
                  </span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">Fără recenzii încă</span>
              )}
            </div>
          </div>

          {/* Description */}
          {provider.short_description && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">
              {provider.short_description}
            </p>
          )}

          {/* Services badges */}
          {services.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {services.map((svc) => (
                <Badge key={svc.category?.slug} variant="secondary" className="text-xs gap-1">
                  <span>{svc.category?.icon}</span>
                  {svc.category?.name}
                </Badge>
              ))}
              {provider.provider_services?.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{provider.provider_services.length - 2} altele
                </Badge>
              )}
            </div>
          )}

          {/* Areas */}
          {areas.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>
                {areas.map((a) => a.area?.name).join(', ')}
                {provider.provider_areas?.length > 2 && ` +${provider.provider_areas.length - 2}`}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border flex items-center justify-between">
          <div className="text-sm">
            {provider.starting_price ? (
              <span className="font-semibold text-foreground">
                {formatPrice(provider.starting_price)}
              </span>
            ) : (
              <span className="text-muted-foreground">Preț negociabil</span>
            )}
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-2 transition-all">
            Contactează <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}
