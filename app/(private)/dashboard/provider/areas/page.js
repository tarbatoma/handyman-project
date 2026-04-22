'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { MapPin, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SECTORS } from '@/lib/constants'

export default function ProviderAreasPage() {
  const [areas, setAreas] = useState([])
  const [selectedAreas, setSelectedAreas] = useState([])
  const [providerId, setProviderId] = useState(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: pp }, { data: allAreas }] = await Promise.all([
        supabase.from('provider_profiles').select('id').eq('user_id', user.id).single(),
        supabase.from('areas').select('id, name, slug').order('name'),
      ])

      if (!pp) return
      setProviderId(pp.id)
      setAreas(allAreas || [])

      const { data: providerAreas } = await supabase
        .from('provider_areas')
        .select('area_id')
        .eq('provider_id', pp.id)

      setSelectedAreas(providerAreas?.map((a) => a.area_id) || [])
    }
    load()
  }, [])

  const toggle = (areaId) => {
    setSelectedAreas((prev) =>
      prev.includes(areaId) ? prev.filter((id) => id !== areaId) : [...prev, areaId]
    )
  }

  const save = async () => {
    setLoading(true)
    // Șterge toate și reinserează
    await supabase.from('provider_areas').delete().eq('provider_id', providerId)

    if (selectedAreas.length > 0) {
      await supabase.from('provider_areas').insert(
        selectedAreas.map((areaId) => ({ provider_id: providerId, area_id: areaId }))
      )
    }

    toast.success('Zonele de activitate au fost salvate!')
    setLoading(false)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Zone de activitate</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Selectează sectoarele din București unde oferi servicii
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Sectoare București
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {areas.map((area) => {
              const isSelected = selectedAreas.includes(area.id)
              return (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => toggle(area.id)}
                  className={cn(
                    'flex items-center justify-between p-4 rounded-xl border-2 text-sm font-medium transition-all',
                    isSelected
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:border-primary/40 text-foreground'
                  )}
                >
                  <span>📍 {area.name}</span>
                  {isSelected && <Check className="w-4 h-4" />}
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {selectedAreas.length} sector(e) selectate
            </span>
            <Button onClick={save} disabled={loading} className="gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Salvează zonele
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
