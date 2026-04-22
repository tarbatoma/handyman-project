'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
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
  const supabase = createClient()

  const handleChange = async (newStatus) => {
    setStatus(newStatus)
    const { error } = await supabase
      .from('requests')
      .update({ status: newStatus })
      .eq('id', requestId)

    if (error) {
      toast.error('Eroare la actualizare')
      setStatus(currentStatus)
    } else {
      toast.success('Status actualizat!')
      router.refresh()
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
