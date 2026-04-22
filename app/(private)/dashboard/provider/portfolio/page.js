'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Upload, Trash2, Loader2, Image } from 'lucide-react'

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState([])
  const [providerId, setProviderId] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: pp } = await supabase
        .from('provider_profiles').select('id').eq('user_id', user.id).single()
      if (!pp) return
      setProviderId(pp.id)
      const { data } = await supabase
        .from('provider_portfolio').select('id, image_url, caption').eq('provider_id', pp.id).order('sort_order')
      setPortfolio(data || [])
    }
    load()
  }, [])

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length || !providerId) return
    setUploading(true)

    for (const file of files) {
      const ext = file.name.split('.').pop()
      const filename = `${providerId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('portfolio')
        .upload(filename, file)

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('portfolio').getPublicUrl(filename)
        const { data: dbRow } = await supabase
          .from('provider_portfolio')
          .insert({ provider_id: providerId, image_url: urlData.publicUrl })
          .select()
          .single()
        if (dbRow) setPortfolio((prev) => [...prev, dbRow])
      }
    }

    toast.success('Imagine(i) adăugate cu succes!')
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleDelete = async (item) => {
    await supabase.from('provider_portfolio').delete().eq('id', item.id)
    setPortfolio((prev) => prev.filter((p) => p.id !== item.id))
    toast.success('Imagine ștearsă')
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Portofoliu foto</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Adaugă fotografii ale lucrărilor tale pentru a atrage clienți
        </p>
      </div>

      {/* Upload zone */}
      <Card className="border-dashed border-2 border-border hover:border-primary/50 transition-colors cursor-pointer"
        onClick={() => fileRef.current?.click()}
      >
        <CardContent className="py-12 text-center">
          <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium mb-1">Încarcă fotografii</p>
          <p className="text-sm text-muted-foreground">Trage fișierele sau apasă pentru a selecta</p>
          <p className="text-xs text-muted-foreground mt-2">JPG, PNG sau WebP, max 10MB per imagine</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
          {uploading && (
            <div className="flex items-center justify-center gap-2 mt-4 text-primary">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Se încarcă...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gallery */}
      {!portfolio.length ? (
        <div className="text-center py-8 text-muted-foreground">
          <Image className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">Nicio fotografie adăugată încă</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {portfolio.map((item) => (
            <div key={item.id} className="group relative aspect-square rounded-xl overflow-hidden bg-muted">
              <img
                src={item.image_url}
                alt={item.caption || 'Portofoliu'}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant="destructive"
                  size="icon"
                  className="w-9 h-9"
                  onClick={() => handleDelete(item)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
