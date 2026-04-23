'use client'

import { useState } from 'react'
import { db } from '@/lib/firebase/client'
import { doc, collection, addDoc, getDoc, updateDoc, writeBatch } from 'firebase/firestore'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'

const schema = z.object({
  comment: z.string().min(10, 'Recenzia trebuie să aibă minim 10 caractere.'),
})

export default function ReviewForm({ providerId, clientId, requestId, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const router = useRouter()

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema)
  })

  const onSubmit = async (data) => {
    if (rating === 0) {
      toast.error('Te rog să acorzi un număr de stele (1-5)')
      return
    }

    setLoading(true)
    try {
      // 1. Add the review document
      const reviewDocRef = await addDoc(collection(db, 'reviews'), {
        provider_id: providerId,
        client_id: clientId,
        request_id: requestId,
        rating,
        comment: data.comment,
        created_at: new Date().toISOString()
      })

      // 2. Fetch current provider stats
      const providerRef = doc(db, 'providers', providerId)
      const providerSnap = await getDoc(providerRef)
      
      if (providerSnap.exists()) {
        const pData = providerSnap.data()
        const currentTotal = pData.total_reviews || 0
        const currentAvg = pData.average_rating || 0

        // Calculate new average
        const newTotal = currentTotal + 1
        const newAvg = ((currentAvg * currentTotal) + rating) / newTotal

        // 3. Update provider stats
        await updateDoc(providerRef, {
          total_reviews: newTotal,
          average_rating: Number(newAvg.toFixed(1)),
          updated_at: new Date().toISOString()
        })
      }

      toast.success('Recenzia a fost trimisă cu succes!')
      reset()
      setRating(0)
      if (onSuccess) onSuccess()
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error('Eroare la adăugarea recenziei')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-muted/30 p-4 rounded-xl border border-border mt-4">
      <h4 className="font-semibold mb-3">Lasă o recenzie pentru prestator</h4>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        {/* Star Rating */}
        <div className="space-y-2">
          <Label>Cum ai evalua colaborarea?</Label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-colors"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
              >
                <Star 
                  className={`w-7 h-7 ${
                    star <= (hoveredRating || rating) 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : 'text-gray-300 dark:text-gray-600'
                  }`} 
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-muted-foreground">
              {rating > 0 ? `${rating} / 5` : ''}
            </span>
          </div>
        </div>

        {/* Comment */}
        <div className="space-y-2">
          <Label htmlFor="comment">Comentariu *</Label>
          <Textarea 
            id="comment" 
            placeholder="Descrie experiența ta cu acest prestator..." 
            rows={3}
            {...register('comment')}
            className={errors.comment ? 'border-destructive' : ''}
          />
          {errors.comment && <p className="text-xs text-destructive">{errors.comment.message}</p>}
        </div>

        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Se salvează...</> : 'Trimite Recenzia'}
        </Button>
      </form>
    </div>
  )
}
