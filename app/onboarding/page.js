'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2, User, Wrench, ArrowRight, Check, Building, Building2 } from 'lucide-react'
import { cn, slugify } from '@/lib/utils'
import Navbar from '@/components/layout/Navbar'

export default function OnboardingPage() {
  const [role, setRole] = useState(null)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [isFetchingProfile, setIsFetchingProfile] = useState(true)
  const [areasList, setAreasList] = useState([])
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      const { data } = await supabase
        .from('profiles')
        .select('role, onboarding_completed')
        .eq('id', user.id)
        .maybeSingle()
      if (data?.onboarding_completed) { router.push('/dashboard'); return }
      if (data?.role) setRole(data.role)
      setIsFetchingProfile(false)
    })

    // Fetch locations for select
    supabase.from('areas').select('id, name, type').eq('is_active', true).order('name').then(({ data }) => {
      if (data) setAreasList(data)
    })
  }, [])

  const schema = z.object({
    // Client & Provider
    locationId: z.string().min(1, 'Selectează o locație din listă'),
    phone: z.string().optional(),
    whatsappNumber: z.string().optional(),
    
    // Provider Only
    providerType: z.enum(['individual', 'pfa', 'srl']).optional(),
    businessName: z.string().optional(),
    cui: z.string().optional(),
    regCom: z.string().optional(),
    shortDescription: z.string().optional(),
  }).superRefine((data, ctx) => {
    if (role === 'provider') {
      if (!data.businessName || data.businessName.length < 2) {
        ctx.addIssue({ path: ['businessName'], message: 'Numele firmei/tău este obligatoriu', code: z.ZodIssueCode.custom })
      }
      if (!data.phone || data.phone.length < 10) {
        ctx.addIssue({ path: ['phone'], message: 'Numărul de telefon este obligatoriu pentru meseriași', code: z.ZodIssueCode.custom })
      }
      if ((data.providerType === 'pfa' || data.providerType === 'srl') && !data.cui) {
        ctx.addIssue({ path: ['cui'], message: 'Codul de Înregistrare (CUI/CIF) este obligatoriu', code: z.ZodIssueCode.custom })
      }
      if (!data.shortDescription || data.shortDescription.length < 20) {
        ctx.addIssue({ path: ['shortDescription'], message: 'Adaugă o scurtă descriere de minim 20 caractere', code: z.ZodIssueCode.custom })
      }
    }
  })

  const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      providerType: 'individual',
      locationId: '',
    }
  })

  const providerType = watch('providerType')

  const handleRole = async (selectedRole) => {
    setRole(selectedRole)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('profiles').upsert({ id: user.id, role: selectedRole })
  }

  const nextStep = async (currentStep) => {
    let fieldsToValidate = []
    if (role === 'provider') {
      if (currentStep === 1) fieldsToValidate = ['providerType', 'businessName', 'cui', 'regCom']
      if (currentStep === 2) fieldsToValidate = ['locationId', 'phone', 'whatsappNumber']
    }
    
    const isStepValid = await trigger(fieldsToValidate)
    if (isStepValid) setStep(currentStep + 1)
  }

  const onSubmit = async (data) => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    try {
      if (role === 'provider') {
        const slug = slugify(data.businessName) + '-' + Math.random().toString(36).slice(2, 6)
        
        // 1. Inserare profil provider
        const { error: ppError } = await supabase
          .from('provider_profiles')
          .insert({
            user_id: user.id,
            provider_type: data.providerType,
            business_name: data.businessName,
            slug,
            cui: data.cui || null,
            reg_com: data.regCom || null,
            short_description: data.shortDescription,
          })

        if (ppError) throw ppError

        // 2. Update profil public
        await supabase.from('profiles').upsert({
          id: user.id,
          phone: data.phone,
          whatsapp_number: data.whatsappNumber || null,
          location_id: data.locationId,
          onboarding_completed: true,
          role: 'provider'
        })

      } else {
        // Client Update
        await supabase.from('profiles').upsert({
          id: user.id,
          phone: data.phone || null,
          whatsapp_number: data.whatsappNumber || null,
          location_id: data.locationId,
          onboarding_completed: true,
          role: 'client'
        })
      }

      toast.success('Profilul tău a fost creat cu succes!')
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      toast.error('A apărut o eroare la salvarea datelor.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (isFetchingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!role) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 pt-16">
          <div className="max-w-lg w-full text-center">
          <h1 className="text-3xl font-bold mb-2">Bun venit pe MeșterHub!</h1>
          <p className="text-muted-foreground mb-10">Cum vrei să folosești platforma?</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { type: 'client', icon: '👤', label: 'Caut Servicii', desc: 'Sunt client și caut meseriași' },
              { type: 'provider', icon: '🔧', label: 'Ofer Servicii', desc: 'Sunt meseriaș/firmă' },
            ].map(({ type, icon, label, desc }) => (
              <button
                key={type}
                onClick={() => handleRole(type)}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all"
              >
                <span className="text-4xl">{icon}</span>
                <span className="font-semibold text-foreground">{label}</span>
                <span className="text-sm text-muted-foreground">{desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 pt-24">
        <div className="max-w-3xl mx-auto">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, role === 'provider' ? 3 : null].filter(Boolean).map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors',
                  step >= s ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                )}>
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < (role === 'provider' ? 3 : 2) && (
                  <div className={cn('h-1 w-16 md:w-24 rounded-full', step > s ? 'bg-primary' : 'bg-gray-200')} />
                )}
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-border p-6 md:p-10">
            <form onSubmit={handleSubmit(onSubmit)}>
              
              {/* STEP 1: DATE COMPANIE (Doar Provider) */}
              {step === 1 && role === 'provider' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Informații Profesionale</h2>
                    <p className="text-muted-foreground">Spune-ne cum lucrezi (ca persoană fizică sau cu firmă).</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {[
                      { id: 'individual', label: 'Persoană Fizică / Meșter', icon: User },
                      { id: 'pfa', label: 'PFA / Întreprindere', icon: Building },
                      { id: 'srl', label: 'Firmă / SRL', icon: Building2 },
                    ].map(({ id, label, icon: Icon }) => (
                      <div 
                        key={id}
                        onClick={() => setValue('providerType', id)}
                        className={cn(
                          "cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-2 text-center transition-all",
                          providerType === id ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/30 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-sm font-semibold">{label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nume {providerType === 'individual' ? 'Public / Brand' : 'Firmă (Companie)'} *</Label>
                      <Input placeholder={providerType === 'individual' ? "Ex: Ion Instalatorul" : "Ex: Instalatorii Profesioniști SRL"} {...register('businessName')} />
                      {errors.businessName && <p className="text-xs text-destructive">{errors.businessName.message}</p>}
                    </div>

                    {providerType !== 'individual' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>CUI / CIF *</Label>
                          <Input placeholder="Ex: RO12345678" {...register('cui')} />
                          {errors.cui && <p className="text-xs text-destructive">{errors.cui.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label>Nr. Reg. Comerțului (Opțional)</Label>
                          <Input placeholder="Ex: J40/1234/2020" {...register('regCom')} />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button type="button" onClick={() => nextStep(1)} className="gap-2">
                      Continuă <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 2: LOCAȚIE ȘI CONTACT (Provider & Client) */}
              {((step === 2 && role === 'provider') || (step === 1 && role === 'client')) && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Locație & Contact</h2>
                    <p className="text-muted-foreground">
                      {role === 'provider' 
                        ? 'Avem nevoie de aceste date pentru a te conecta cu clienții.' 
                        : 'Pentru a-ți recomanda cele mai bune servicii din zona ta.'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Oraș / Sector *</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      {...register('locationId')}
                    >
                      <option value="">Alege o locație...</option>
                      {areasList.map(area => (
                        <option key={area.id} value={area.id}>{area.name} ({area.type})</option>
                      ))}
                    </select>
                    {errors.locationId && <p className="text-xs text-destructive">{errors.locationId.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Telefon {role === 'provider' ? '*' : '(Opțional)'}</Label>
                      <Input placeholder="07xx xxx xxx" {...register('phone')} />
                      {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>WhatsApp (Opțional)</Label>
                      <Input placeholder="07xx xxx xxx" {...register('whatsappNumber')} />
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    {role === 'provider' && (
                      <Button type="button" variant="outline" onClick={() => setStep(1)}>Înapoi</Button>
                    )}
                    <Button 
                      type={role === 'client' ? 'submit' : 'button'} 
                      onClick={() => role === 'provider' && nextStep(2)} 
                      className={cn("gap-2", role === 'client' && "ml-auto")}
                      disabled={loading}
                    >
                      {role === 'provider' ? <>Continuă <ArrowRight className="w-4 h-4" /></> : (loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Finalizează')}
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: DESCRIERE PROFIL (Doar Provider) */}
              {step === 3 && role === 'provider' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Prezentare Profil</h2>
                    <p className="text-muted-foreground">Scrie o scurtă descriere care să atragă clienții. (Aceasta va apărea pe profilul tău public)</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Scurtă descriere (Bio) *</Label>
                    <Textarea
                      placeholder="Ex: Suntem o echipă de electricieni cu 10 ani experiență în București. Executăm instalații complete pentru case și apartamente..."
                      rows={5}
                      {...register('shortDescription')}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{errors.shortDescription?.message || 'Minim 20 caractere'}</span>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 p-4 rounded-xl text-sm">
                    💡 <strong>Sfat:</strong> După ce finalizezi crearea profilului, vei putea adăuga Anunțuri detaliate cu prețuri și imagini din Dashboard.
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={() => setStep(2)}>Înapoi</Button>
                    <Button type="submit" disabled={loading} className="gap-2">
                      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Finalizează și Mergi la Dashboard
                    </Button>
                  </div>
                </div>
              )}

            </form>
          </div>
        </div>
      </div>
    </>
  )
}
