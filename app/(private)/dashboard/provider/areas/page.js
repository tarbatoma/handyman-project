'use client'

import { useState, useEffect } from 'react'
import { auth, db } from '@/lib/firebase/client'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, query, where, getDocs, doc, writeBatch, orderBy } from 'firebase/firestore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { MapPin, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ProviderAreasPage() {
  const [areas, setAreas] = useState([])
  const [selectedAreas, setSelectedAreas] = useState([])
  const [providerId, setProviderId] = useState(null)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return
      setProviderId(user.uid)

      try {
        const [areasSnap, providerAreasSnap] = await Promise.all([
          getDocs(query(collection(db, 'areas'), orderBy('name'))),
          getDocs(query(collection(db, 'provider_areas'), where('provider_id', '==', user.uid)))
        ])

        const allAreas = areasSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        setAreas(allAreas)

        const selected = providerAreasSnap.docs.map(d => d.data().area_id)
        setSelectedAreas(selected)
      } catch (error) {
        console.error(error)
      }
    })
    return () => unsubscribe()
  }, [])

  const toggle = (areaId) => {
    setSelectedAreas((prev) =>
      prev.includes(areaId) ? prev.filter((id) => id !== areaId) : [...prev, areaId]
    )
  }

  const save = async () => {
    setLoading(true)
    try {
      const batch = writeBatch(db)
      
      const q = query(collection(db, 'provider_areas'), where('provider_id', '==', providerId))
      const snapshot = await getDocs(q)
      snapshot.forEach(d => batch.delete(d.ref))

      selectedAreas.forEach(areaId => {
        const newDocRef = doc(collection(db, 'provider_areas'))
        batch.set(newDocRef, { provider_id: providerId, area_id: areaId })
      })

      await batch.commit()
      toast.success('Zonele de activitate au fost salvate!')
    } catch (error) {
      console.error(error)
      toast.error('Eroare la salvare')
    }
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
