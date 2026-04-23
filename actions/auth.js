'use server'

import { cookies } from 'next/headers'
import { adminAuth } from '@/lib/firebase/server'

export async function createSession(idToken) {
  try {
    const expiresIn = 60 * 60 * 24 * 5 * 1000 // 5 days
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn })
    const cookieStore = await cookies()
    
    cookieStore.set('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error creating session cookie:', error)
    return { error: 'Unauthorized request!' }
  }
}

export async function removeSession() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('session')
    return { success: true }
  } catch (error) {
    console.error('Error removing session cookie:', error)
    return { error: 'Failed to remove session' }
  }
}
