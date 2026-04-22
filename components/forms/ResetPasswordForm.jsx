'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'

const schema = z.object({
  email: z.string().email('Email invalid'),
})

export default function ResetPasswordForm() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/dashboard/settings`,
    })

    if (error) {
      toast.error('Eroare la trimiterea emailului')
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <Card className="shadow-xl">
        <CardContent className="pt-10 pb-8 text-center">
          <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Email trimis!</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Verifică emailul tău pentru linkul de resetare a parolei.
          </p>
          <Link href="/login"><Button variant="outline">Înapoi la autentificare</Button></Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Resetare parolă</CardTitle>
        <CardDescription>Introdu emailul și-ți trimitem un link de resetare</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@exemplu.ro"
              {...register('email')}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Se trimite...</> : 'Trimite linkul'}
          </Button>
        </form>
        <div className="mt-5 text-center">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Înapoi la autentificare
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
