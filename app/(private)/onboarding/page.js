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
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { Loader2, User, Wrench, ArrowRight, Check } from 'lucide-react'
import { cn, slugify } from '@/lib/utils'
import { SECTORS, SERVICE_CATEGORIES } from '@/lib/constants'

export default function OnboardingPage() {
  const [role, setRole] = useState(null)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [selectedSectors, setSelectedSectors] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      const { data } = await supabase
        .from('profiles')
        .select('role, onboarding_completed')
        .eq('id', user.id)
        .single()
      if (data?.onboarding_completed) { router.push('/dashboard'); return }
      if (data?.role) setRole(data.role)
    })
  }, [])

  const clientSchema = z.object({
    phone: z.string().optional(),
  })

  const providerSchema = z.object({
    businessName: z.string().min(2, 'Numele firmei este obligatoriu'),
    phone: z.string().min(10, 'Număr de telefon invalid'),
    shortDescription: z.string().min(20, 'Minim 20 caractere').max(200),
    longDescription: z.string().optional(),
    yearsExperience: z.coerce.number().min(0).max(50).optional(),
    startingPrice: z.coerce.number().min(0).optional(),
  })

  const schema = role === 'provider' ? providerSchema : clientSchema

  const { register, handleSubmit, getValues, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const handleRole = async (selectedRole) => {
    setRole(selectedRole)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('profiles').update({ role: selectedRole }).eq('id', user.id)
  }

  const onSubmit = async (data) => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    try {
      if (role === 'provider') {
        // Creare profil prestator
        const slug = slugify(data.businessName) + '-' + Math.random().toString(36).slice(2, 6)
        const { data: providerProfile, error: ppError } = await supabase
          .from('provider_profiles')
          .insert({
            user_id: user.id,
            business_name: data.businessName,
            slug,
            short_description: data.shortDescription,
            long_description: data.longDescription,
            years_experience: data.yearsExperience || 0,
            starting_price: data.startingPrice || null,
          })
          .select()
          .single()

        if (ppError) throw ppError

        // Adaugare zone
        if (selectedSectors.length > 0) {
          const { data: areas } = await supabase
            .from('areas')
            .select('id, slug')
            .in('slug', selectedSectors)

          await supabase.from('provider_areas').insert(
            areas.map((a) => ({ provider_id: providerProfile.id, area_id: a.id }))
          )
        }

        // Adaugare categorii servicii dacă există
        if (selectedCategories.length > 0) {
          const { data: cats } = await supabase
            .from('service_categories')
            .select('id, slug')
            .in('slug', selectedCategories)

          await supabase.from('provider_services').insert(
            cats.map((c) => ({
              provider_id: providerProfile.id,
              category_id: c.id,
              title: c.name || 'Serviciu',
            }))
          )
        }

        // Update profil general
        await supabase.from('profiles').update({
          phone: data.phone,
          onboarding_completed: true,
        }).eq('id', user.id)

      } else {
        // Client - doar marcare onboarding completat
        await supabase.from('profiles').update({
          phone: data.phone,
          onboarding_completed: true,
        }).eq('id', user.id)
      }

      toast.success('Profilul tău a fost creat cu succes!')
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      toast.error('A apărut o eroare. Încearcă din nou.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleSector = (slug) => {
    setSelectedSectors((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    )
  }

  const toggleCategory = (slug) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    )
  }

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-lg w-full text-center">
          <h1 className="text-3xl font-bold mb-2">Bun venit pe MeșterHub!</h1>
          <p className="text-muted-foreground mb-10">Cum vrei să folosești platforma?</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { type: 'client', icon: '👤', label: 'Caut un meseriaș', desc: 'Vreau să găsesc prestatori de servicii' },
              { type: 'provider', icon: '🔧', label: 'Ofer servicii', desc: 'Vreau să primesc cereri de la clienți' },
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
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, role === 'provider' ? 3 : null].filter(Boolean).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors',
                step >= s ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
              )}>
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < (role === 'provider' ? 3 : 2) && (
                <div className={cn('h-0.5 w-16', step > s ? 'bg-primary' : 'bg-gray-200')} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-border p-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Date de baza */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold mb-1">
                    {role === 'provider' ? '🔧 Configurare profil prestator' : '👤 Completează profilul tău'}
                  </h2>
                  <p className="text-muted-foreground text-sm">Câteva informații de bază pentru a începe</p>
                </div>

                {role === 'provider' && (
                  <div className="space-y-2">
                    <Label>Numele firmei / Numele tău *</Label>
                    <Input placeholder="Ex: Ion Popescu Construcții" {...register('businessName')} />
                    {errors.businessName && <p className="text-xs text-destructive">{errors.businessName.message}</p>}
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Număr de telefon {role === 'provider' ? '*' : '(opțional)'}</Label>
                  <Input placeholder="07xx xxx xxx" {...register('phone')} />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                </div>

                {role === 'provider' && (
                  <>
                    <div className="space-y-2">
                      <Label>Descriere scurtă * <span className="text-muted-foreground text-xs">(max 200 caractere)</span></Label>
                      <Textarea
                        placeholder="Ex: Zugrav profesionist cu 10 ani experiență în București..."
                        rows={3}
                        {...register('shortDescription')}
                      />
                      {errors.shortDescription && <p className="text-xs text-destructive">{errors.shortDescription.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Ani de experiență</Label>
                        <Input type="number" placeholder="0" min="0" max="50" {...register('yearsExperience')} />
                      </div>
                      <div className="space-y-2">
                        <Label>Preț de pornire (RON)</Label>
                        <Input type="number" placeholder="0" min="0" {...register('startingPrice')} />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    onClick={() => setStep(role === 'provider' ? 2 : null)}
                    className="gap-2"
                    disabled={!getValues('businessName') && role === 'provider'}
                    {...(role === 'client' && { type: 'submit' })}
                  >
                    {role === 'provider' ? <>Continuă <ArrowRight className="w-4 h-4" /></> : loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Finalizează'}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Categorii (provider) */}
            {step === 2 && role === 'provider' && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Selectează serviciile tale</h2>
                  <p className="text-muted-foreground text-sm">Ce tipuri de servicii oferi? (poți alege mai multe)</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {SERVICE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => toggleCategory(cat.slug)}
                      className={cn(
                        'flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all text-left',
                        selectedCategories.includes(cat.slug)
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:border-primary/40'
                      )}
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <span className="text-xs">{cat.name}</span>
                      {selectedCategories.includes(cat.slug) && (
                        <Check className="w-3.5 h-3.5 ml-auto shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex justify-between pt-2">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>Înapoi</Button>
                  <Button type="button" onClick={() => setStep(3)} className="gap-2">
                    Continuă <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Zone (provider) */}
            {step === 3 && role === 'provider' && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Zone de activitate</h2>
                  <p className="text-muted-foreground text-sm">În ce sectoare din București lucrezi?</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {SECTORS.map((sector) => (
                    <button
                      key={sector.slug}
                      type="button"
                      onClick={() => toggleSector(sector.slug)}
                      className={cn(
                        'flex items-center justify-between p-4 rounded-xl border-2 text-sm font-medium transition-all',
                        selectedSectors.includes(sector.slug)
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:border-primary/40'
                      )}
                    >
                      <span>📍 {sector.name}</span>
                      {selectedSectors.includes(sector.slug) && (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex justify-between pt-2">
                  <Button type="button" variant="outline" onClick={() => setStep(2)}>Înapoi</Button>
                  <Button type="submit" disabled={loading} className="gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {loading ? 'Se creează profilul...' : 'Finalizează profilul'}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
