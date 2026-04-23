import { cookies } from 'next/headers'
import { adminAuth, adminDb } from '@/lib/firebase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value

  if (!sessionCookie) redirect('/login')

  let redirectTo = '/login'
  
  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true)
    const userDoc = await adminDb.collection('users').doc(decodedClaims.uid).get()
    const profile = userDoc.data()

    if (profile?.role === 'provider') {
      redirectTo = '/dashboard/provider'
    } else {
      redirectTo = '/dashboard/client'
    }
  } catch (error) {
    console.error('Session verification failed:', error)
  }

  redirect(redirectTo)
}
