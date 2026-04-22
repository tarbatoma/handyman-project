'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Send } from 'lucide-react'
import { SECTORS } from '@/lib/constants'

const requestSchema = z.object({
  title: z.string().min(5, 'Minim 5 caractere'),
  description: z.string().min(20, 'Descrie mai detaliat cererea ta (min 20 caractere)'),
  area_slug: z.string().optional(),
  budget: z.coerce.number().positive().optional().nullable(),
  client_phone: z.string().optional(),
})

export default function RequestForm({ providerId, providerName }) {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [areas, setAreas] = useState([])
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    supabase.from('areas').select('id, name, slug').then(({ data }) => setAreas(data || []))
  }, [])

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(requestSchema),
  })

  const onSubmit = async (data) => {
    if (!user) {
      toast.error('Trebuie să fii autentificat pentru a trimite o cerere')
      router.push('/login')
      return
    }

    setLoading(true)
    const area = areas.find((a) => a.slug === data.area_slug)

    const { error } = await supabase.from('requests').insert({
      client_id: user.id,
      provider_id: providerId,
      title: data.title,
      description: data.description,
      area_id: area?.id || null,
      budget: data.budget || null,
      client_phone: data.client_phone || null,
    })

    if (error) {
      toast.error('Eroare la trimiterea cererii')
      setLoading(false)
      return
    }

    toast.success('Cererea a fost trimisă cu succes! Prestatorul te va contacta în curând.')
    setLoading(false)
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Send className="w-4 h-4" />
          Trimite o cerere
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Contactează direct {providerName}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-sm">Titlu cerere *</Label>
            <Input
              id="title"
              placeholder="Ex: Zugrăvit dormitor 15mp"
              {...register('title')}
              className={errors.title ? 'border-destructive text-sm' : 'text-sm'}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-sm">Descriere *</Label>
            <Textarea
              id="description"
              placeholder="Descrie lucrarea, suprafața, materialele necesare..."
              rows={3}
              {...register('description')}
              className={errors.description ? 'border-destructive text-sm' : 'text-sm'}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Sector</Label>
            <Select onValueChange={(val) => setValue('area_slug', val)}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Alege sectorul" />
              </SelectTrigger>
              <SelectContent>
                {SECTORS.map((s) => (
                  <SelectItem key={s.slug} value={s.slug}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="budget" className="text-sm">Buget estimat (RON)</Label>
              <Input
                id="budget"
                type="number"
                placeholder="opțional"
                {...register('budget')}
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="client_phone" className="text-sm">Telefon</Label>
              <Input
                id="client_phone"
                placeholder="07xx xxx xxx"
                {...register('client_phone')}
                className="text-sm"
              />
            </div>
          </div>

          <Button type="submit" className="w-full gap-2" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {loading ? 'Se trimite...' : 'Trimite cererea'}
          </Button>

          {!user && (
            <p className="text-xs text-center text-muted-foreground">
              Trebuie să fii{' '}
              <a href="/login" className="text-primary hover:underline">autentificat</a>{' '}
              pentru a trimite cereri
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
