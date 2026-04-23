'use client'

import { useState, useEffect } from 'react'
import { auth, db } from '@/lib/firebase/client'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, orderBy } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Plus, Trash2, Loader2, Briefcase } from 'lucide-react'

const serviceSchema = z.object({
  category_id: z.string().min(1, 'Selectați o categorie'),
  title: z.string().min(3, 'Minim 3 caractere'),
  description: z.string().optional(),
  price_from: z.coerce.number().positive().optional().nullable(),
  price_unit: z.string().optional(),
})

export default function ProviderServicesPage() {
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [providerId, setProviderId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const router = useRouter()


  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm({
    resolver: zodResolver(serviceSchema),
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return
      setProviderId(user.uid)

      try {
        const [svcsSnap, catsSnap] = await Promise.all([
          getDocs(query(collection(db, 'provider_services'), where('provider_id', '==', user.uid))),
          getDocs(query(collection(db, 'service_categories'), orderBy('sort_order')))
        ])

        const cats = catsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        const catsMap = cats.reduce((acc, c) => ({ ...acc, [c.id]: c }), {})

        const svcs = svcsSnap.docs.map(d => {
          const data = d.data()
          return {
            id: d.id,
            ...data,
            category: catsMap[data.category_id] || null
          }
        }).sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))

        setCategories(cats)
        setServices(svcs)
      } catch (err) {
        console.error(err)
      }
    })
    return () => unsubscribe()
  }, [])

  const onAdd = async (data) => {
    setLoading(true)
    try {
      const newSvcData = {
        provider_id: providerId,
        category_id: data.category_id,
        title: data.title,
        description: data.description || null,
        price_from: data.price_from || null,
        price_unit: data.price_unit || 'proiect',
        created_at: new Date().toISOString()
      }
      
      const docRef = await addDoc(collection(db, 'provider_services'), newSvcData)
      
      const cat = categories.find(c => c.id === data.category_id)
      
      setServices(prev => [{
        id: docRef.id,
        ...newSvcData,
        category: cat
      }, ...prev])

      toast.success('Serviciu adăugat!')
      reset()
      setShowForm(false)
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error('Eroare la adăugare')
    }
    setLoading(false)
  }

  const onDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'provider_services', id))
      setServices((prev) => prev.filter((s) => s.id !== id))
      toast.success('Serviciu șters')
    } catch (error) {
      console.error(error)
      toast.error('Eroare la ștergere')
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Serviciile mele</h1>
          <p className="text-muted-foreground text-sm mt-1">{services.length} servicii listate</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          Adaugă serviciu
        </Button>
      </div>

      {/* Add form */}
      {showForm && (
        <Card className="border-primary/30">
          <CardHeader><CardTitle className="text-base">Serviciu nou</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onAdd)} className="space-y-4">
              <div className="space-y-2">
                <Label>Categorie *</Label>
                <Select onValueChange={(v) => setValue('category_id', v)}>
                  <SelectTrigger className={errors.category_id ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Selectează categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category_id && <p className="text-xs text-destructive">{errors.category_id.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Titlu serviciu *</Label>
                <Input placeholder="Ex: Zugrăvit apartamente" {...register('title')} className={errors.title ? 'border-destructive' : ''} />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Descriere</Label>
                <Textarea placeholder="Detaliază ce include serviciul..." rows={2} {...register('description')} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preț de la (RON)</Label>
                  <Input type="number" placeholder="0" {...register('price_from')} />
                </div>
                <div className="space-y-2">
                  <Label>Per</Label>
                  <Select onValueChange={(v) => setValue('price_unit', v)} defaultValue="proiect">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['proiect', 'oră', 'zi', 'mp', 'ml'].map((u) => (
                        <SelectItem key={u} value={u}>{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="gap-2">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />} Salvează
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); reset() }}>
                  Anulează
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Services list */}
      {!services.length ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-20" />
            <p className="text-muted-foreground text-sm">Nu ai adăugat niciun serviciu încă</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {services.map((svc) => (
            <Card key={svc.id}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{svc.category?.icon}</span>
                      <span className="font-medium">{svc.title}</span>
                      <Badge variant="secondary" className="text-xs">{svc.category?.name}</Badge>
                    </div>
                    {svc.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">{svc.description}</p>
                    )}
                    {svc.price_from && (
                      <p className="text-sm font-semibold text-primary mt-1">
                        de la {svc.price_from} RON / {svc.price_unit}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(svc.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
