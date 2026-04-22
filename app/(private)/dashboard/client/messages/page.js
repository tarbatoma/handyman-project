import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare } from 'lucide-react'

export const metadata = { title: 'Mesajele mele' }

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mesajele mele</h1>
        <p className="text-muted-foreground text-sm mt-1">Conversații cu prestatorii</p>
      </div>
      <Card>
        <CardContent className="py-16 text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-20" />
          <h3 className="font-semibold text-lg mb-2">Niciun mesaj</h3>
          <p className="text-muted-foreground text-sm">
            Trimite o cerere unui prestator pentru a începe o conversație
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
