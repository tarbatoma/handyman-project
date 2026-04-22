'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { LogOut, Trash2, Shield } from 'lucide-react'

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast.success('Ai fost deconectat')
    router.push('/')
    router.refresh()
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Setări cont</h1>
        <p className="text-muted-foreground text-sm mt-1">Gestionează preferințele contului tău</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="w-4 h-4" /> Securitate</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Schimbă parola</p>
              <p className="text-xs text-muted-foreground">Trimitem un email de resetare a parolei</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const { data: { user } } = await supabase.auth.getUser()
                await supabase.auth.resetPasswordForEmail(user.email)
                toast.success('Email de resetare trimis!')
              }}
            >
              Resetează parola
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Cont</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Deconectare</p>
              <p className="text-xs text-muted-foreground">Ieși din contul tău</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" /> Deconectare
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm text-destructive">Ștergere cont</p>
              <p className="text-xs text-muted-foreground">Acțiune ireversibilă</p>
            </div>
            <Button variant="destructive" size="sm" className="gap-2" disabled>
              <Trash2 className="w-4 h-4" /> Șterge contul
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
