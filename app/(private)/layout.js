import { cookies } from 'next/headers'
import { adminAuth, adminDb } from '@/lib/firebase/server'
import { redirect } from 'next/navigation'
import DashboardSidebar from '@/components/layout/DashboardSidebar'
import Navbar from '@/components/layout/Navbar'

export default async function PrivateLayout({ children }) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value

  if (!sessionCookie) redirect('/login')

  let profile = null
  let user = null

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true)
    user = decodedClaims
    
    const userDoc = await adminDb.collection('users').doc(user.uid).get()
    profile = userDoc.data()
  } catch (error) {
    redirect('/login')
  }

  // Redirecționare la onboarding dacă nu e completat sau nu există profil
  if (!profile || !profile.onboarding_completed) {
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
