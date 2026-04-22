'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function FavoriteButton({ providerId, clientId }) {
  const [isFav, setIsFav] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('favorites')
      .select('id')
      .eq('client_id', clientId)
      .eq('provider_id', providerId)
      .maybeSingle()
      .then(({ data }) => setIsFav(!!data))
  }, [clientId, providerId])

  const toggle = async () => {
    setLoading(true)
    if (isFav) {
      await supabase
        .from('favorites')
        .delete()
        .eq('client_id', clientId)
        .eq('provider_id', providerId)
      setIsFav(false)
      toast.success('Eliminat din favorite')
    } else {
      await supabase.from('favorites').insert({ client_id: clientId, provider_id: providerId })
      setIsFav(true)
      toast.success('Adăugat la favorite!')
    }
    setLoading(false)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn('w-full gap-2', isFav && 'text-rose-500 border-rose-200 hover:text-rose-600')}
      onClick={toggle}
      disabled={loading}
    >
      <Heart className={cn('w-4 h-4', isFav && 'fill-rose-500')} />
      {isFav ? 'Salvat la favorite' : 'Salvează la favorite'}
    </Button>
  )
}
