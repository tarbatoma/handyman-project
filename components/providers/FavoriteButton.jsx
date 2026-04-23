'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase/client'
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function FavoriteButton({ providerId, clientId }) {
  const [isFav, setIsFav] = useState(false)
  const [loading, setLoading] = useState(false)
  const [favDocId, setFavDocId] = useState(null)

  useEffect(() => {
    const load = async () => {
      const q = query(collection(db, 'favorites'), where('client_id', '==', clientId), where('provider_id', '==', providerId))
      const snap = await getDocs(q)
      if (!snap.empty) {
        setIsFav(true)
        setFavDocId(snap.docs[0].id)
      }
    }
    load()
  }, [clientId, providerId])

  const toggle = async () => {
    setLoading(true)
    try {
      if (isFav && favDocId) {
        await deleteDoc(doc(db, 'favorites', favDocId))
        setIsFav(false)
        setFavDocId(null)
        toast.success('Eliminat din favorite')
      } else {
        const dbRef = await addDoc(collection(db, 'favorites'), { client_id: clientId, provider_id: providerId, created_at: new Date().toISOString() })
        setIsFav(true)
        setFavDocId(dbRef.id)
        toast.success('Adăugat la favorite!')
      }
    } catch (err) {
      console.error(err)
      toast.error('A apărut o eroare')
    }
    setLoading(false)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn('w-full gap-2', isFav && 'text-rose-500 border-rose-200 hover:text-rose-600')}
      onClick={toggle}
      disabled={loading}
    >
      <Heart className={cn('w-4 h-4', isFav && 'fill-rose-500')} />
      {isFav ? 'Salvat la favorite' : 'Salvează la favorite'}
    </Button>
  )
}
