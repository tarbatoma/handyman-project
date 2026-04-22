'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { Loader2, Upload, User } from 'lucide-react'
import { getInitials } from '@/lib/utils'

const profileSchema = z.object({
  full_name: z.string().min(2, 'Minim 2 caractere'),
  phone: z.string().optional(),
})

export default function ProfilePage() {
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const router = useRouter()
  const supabase = createClient()

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('full_name, phone, avatar_url, role')
        .eq('id', user.id)
        .single()
      if (data) {
        setProfile({ ...data, id: user.id })
        reset({ full_name: data.full_name || '', phone: data.phone || '' })
      }
    }
    load()
  }, [])

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    let avatarUrl = profile?.avatar_url

    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop()
      const filename = `${profile.id}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filename, avatarFile, { upsert: true })

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filename)
        avatarUrl = urlData.publicUrl
      }
    }

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: data.full_name, phone: data.phone, avatar_url: avatarUrl })
      .eq('id', profile.id)

    if (error) {
      toast.error('Eroare la salvare')
    } else {
      toast.success('Profilul tău a fost actualizat!')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Profilul meu</h1>
        <p className="text-muted-foreground text-sm mt-1">Actualizează informațiile contului tău</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Informații generale</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Avatar */}
            <div className="flex items-center gap-5">
              <Avatar className="w-20 h-20">
                <AvatarImage src={avatarPreview || profile?.avatar_url} />
                <AvatarFallback className="text-xl bg-primary/10 text-primary">
                  {getInitials(profile?.full_name || '?')}
                </AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="avatar" className="cursor-pointer inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-2 rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors">
                  <Upload className="w-4 h-4" />
                  Schimbă poza
                </Label>
                <input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG sau WebP, max 2MB</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Nume complet</Label>
              <Input id="full_name" {...register('full_name')} className={errors.full_name ? 'border-destructive' : ''} />
              {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input id="phone" placeholder="07xx xxx xxx" {...register('phone')} />
            </div>

            {profile?.role && (
              <div className="space-y-2">
                <Label>Tip cont</Label>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm capitalize">
                    {profile.role === 'provider' ? 'Prestator de servicii' : 'Client'}
                  </span>
                </div>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Se salvează...</> : 'Salvează modificările'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
