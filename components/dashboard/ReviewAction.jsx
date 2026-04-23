'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import ReviewForm from '@/components/forms/ReviewForm'
import { Star, CheckCircle } from 'lucide-react'

export default function ReviewAction({ providerId, clientId, requestId, isReviewed }) {
  const [showForm, setShowForm] = useState(false)
  const [reviewed, setReviewed] = useState(isReviewed)

  if (reviewed) {
    return (
      <div className="mt-4 flex items-center gap-2 text-sm text-green-600 font-medium bg-green-50 p-2 rounded-lg w-max">
        <CheckCircle className="w-4 h-4" /> Ai lăsat o recenzie pentru această lucrare.
      </div>
    )
  }

  return (
    <div className="mt-4 border-t border-border pt-4">
      {!showForm ? (
        <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowForm(true)}>
          <Star className="w-4 h-4" /> Adaugă recenzie
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Acordă o recenzie</span>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Anulează</Button>
          </div>
          <ReviewForm 
            providerId={providerId} 
            clientId={clientId} 
            requestId={requestId} 
            onSuccess={() => setReviewed(true)} 
          />
        </div>
      )}
    </div>
  )
}
