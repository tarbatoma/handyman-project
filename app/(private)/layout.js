import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardSidebar from '@/components/layout/DashboardSidebar'
import Navbar from '@/components/layout/Navbar'

export default async function PrivateLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, onboarding_completed')
    .eq('id', user.id)
    .single()

  // Redirecționare la onboarding dacă nu e completat
  if (!profile?.onboarding_completed) {
    redirect('/onboarding')
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="flex gap-8">
          <div className="hidden md:block">
            <DashboardSidebar role={profile.role} />
          </div>
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </>
  )
}
