'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase/client'
import { createSession } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Email invalid'),
  password: z.string().min(6, 'Parola trebuie să aibă minim 6 caractere'),
})

function LoginFormInner() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'


  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password)
      const idToken = await userCredential.user.getIdToken()
      
      // Setăm cookie-ul de sesiune pe server
      const result = await createSession(idToken)
      
      if (result?.error) {
        toast.error('Eroare la crearea sesiunii')
        setLoading(false)
        return
      }
    } catch (error) {
      console.error(error)
      toast.error('Email sau parolă greșite')
      setLoading(false)
      return
    }

    toast.success('Autentificat cu succes!')
    router.push(redirectTo)
    router.refresh()
  }

  return (
    <Card className="shadow-xl border-border/50">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold">Bun venit înapoi!</CardTitle>
        <CardDescription>Autentifică-te în contul tău MeșterHub</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="email@exemplu.ro"
              {...register('email')}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Parolă</Label>
              <Link href="/reset-password" className="text-xs text-primary hover:underline">
                Ai uitat parola?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                {...register('password')}
                className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Se autentifică...</>
            ) : (
              'Autentificare'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Nu ai cont?{' '}
          <Link href="/register" className="text-primary font-medium hover:underline">
            Înregistrează-te gratuit
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default function LoginForm() {
  return (
    <Suspense fallback={<div className="h-32 flex items-center justify-center text-sm text-muted-foreground">Se încarcă...</div>}>
      <LoginFormInner />
    </Suspense>
  )
}
