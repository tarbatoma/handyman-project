'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth, db } from '@/lib/firebase/client'
import { doc, setDoc } from 'firebase/firestore'
import { createSession } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2, User, Wrench, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'

const registerSchema = z.object({
  fullName: z.string().min(3, 'Numele trebuie să aibă minim 3 caractere'),
  email: z.string().email('Email invalid'),
  password: z.string().min(8, 'Parola trebuie să aibă minim 8 caractere'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Parolele nu coincid',
  path: ['confirmPassword'],
})

function RegisterFormInner() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [selectedType, setSelectedType] = useState('client')
  const router = useRouter()
  const searchParams = useSearchParams()


  // Preselect type from URL (?type=provider)
  useState(() => {
    const type = searchParams.get('type')
    if (type === 'provider') setSelectedType('provider')
  })

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)
      await updateProfile(userCredential.user, { displayName: data.fullName })
      
      const idToken = await userCredential.user.getIdToken()
      const result = await createSession(idToken)

      if (result?.error) {
        toast.error('Eroare la crearea sesiunii')
        setLoading(false)
        return
      }

      // Firestore - salvarea profilului cu rolul
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        full_name: data.fullName,
        email: data.email,
        role: selectedType,
        onboarding_completed: false,
        created_at: new Date().toISOString()
      })

    } catch (error) {
      console.error(error)
      toast.error(error.message || 'Eroare la înregistrare')
      setLoading(false)
      return
    }

    toast.success('Cont creat cu succes!')
    router.push('/onboarding')
    router.refresh()
  }

  if (submitted) {
    return (
      <Card className="shadow-xl border-border/50 text-center py-8">
        <CardHeader>
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-bold">Verifică-ți adresa de email</CardTitle>
          <CardDescription className="text-base mt-2">
            Am trimis un link de confirmare către<br />
            <span className="font-semibold text-foreground">{registeredEmail}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-6">
            Dă click pe linkul din email pentru a-ți activa contul și a continua cu configurarea profilului.
          </p>
          <Button type="button" variant="outline" className="w-full" onClick={() => window.open('https://mail.google.com', '_blank')}>
            Deschide Gmail
          </Button>
          <div className="mt-6 text-sm">
            <button type="button" onClick={() => setSubmitted(false)} className="text-primary hover:underline">
              Înapoi la înregistrare
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-xl border-border/50">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold">Creează-ți un cont</CardTitle>
        <CardDescription>Gratuit, rapid, fără complicații</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Account type selector */}
        <div className="flex gap-3 mb-6">
          {[
            { type: 'client', label: 'Sunt client', icon: User, desc: 'Caut un meseriaș' },
            { type: 'provider', label: 'Sunt prestator', icon: Wrench, desc: 'Ofer servicii' },
          ].map(({ type, label, icon: Icon, desc }) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
              className={cn(
                'flex-1 flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all',
                selectedType === type
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/40'
              )}
            >
              <Icon className={cn('w-6 h-6', selectedType === type ? 'text-primary' : 'text-muted-foreground')} />
              <span className={cn('text-sm font-semibold', selectedType === type ? 'text-primary' : 'text-foreground')}>
                {label}
              </span>
              <span className="text-xs text-muted-foreground">{desc}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nume complet</Label>
            <Input
              id="fullName"
              autoComplete="name"
              placeholder="Ion Popescu"
              {...register('fullName')}
              className={errors.fullName ? 'border-destructive' : ''}
            />
            {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
          </div>

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
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Parolă</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Min. 8 caractere"
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
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmă parola</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              {...register('confirmPassword')}
              className={errors.confirmPassword ? 'border-destructive' : ''}
            />
            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
          </div>

          <Button type="submit" className="w-full h-11 font-semibold mt-2" disabled={loading}>
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Se creează contul...</>
            ) : (
              'Creează contul gratuit'
            )}
          </Button>
        </form>

        <p className="mt-4 text-xs text-center text-muted-foreground">
          Prin înregistrare, ești de acord cu{' '}
          <a href="#" className="text-primary hover:underline">Termenii și condițiile</a>
        </p>

        <div className="mt-5 text-center text-sm text-muted-foreground">
          Ai deja cont?{' '}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Autentifică-te
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default function RegisterForm() {
  return (
    <Suspense fallback={<div className="h-32 flex items-center justify-center text-sm text-muted-foreground">Se încarcă...</div>}>
      <RegisterFormInner />
    </Suspense>
  )
}
