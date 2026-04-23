'use client'

import { useState } from 'react'
import { db } from '@/lib/firebase/client'
import { doc, updateDoc } from 'firebase/firestore'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const statuses = [
  { value: 'new', label: 'Nou' },
  { value: 'in_progress', label: 'În discuție' },
  { value: 'completed', label: 'Finalizat' },
  { value: 'rejected', label: 'Respins' },
]

export default function UpdateRequestStatus({ requestId, currentStatus }) {
  const [status, setStatus] = useState(currentStatus)
  const router = useRouter()

  const handleChange = async (newStatus) => {
    setStatus(newStatus)
    try {
      await updateDoc(doc(db, 'requests', requestId), { status: newStatus })
      toast.success('Status actualizat!')
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error('Eroare la actualizare')
      setStatus(currentStatus)
    }
  }

  return (
    <Select value={status} onValueChange={handleChange}>
      <SelectTrigger className="w-36 text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statuses.map((s) => (
          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
