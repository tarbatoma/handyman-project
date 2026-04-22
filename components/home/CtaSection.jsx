import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Search, Wrench } from 'lucide-react'

export default function CtaSection() {
  return (
    <section className="py-24 hero-gradient relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-6">
          Gata să începi?
        </h2>
        <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
          Fie că ești client sau prestator, MeșterHub te ajută să obții rezultatele dorite rapid și simplu.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/search">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-gray-100 gap-2 h-14 px-8 text-base font-semibold rounded-xl"
            >
              <Search className="w-5 h-5" />
              Caută un meseriaș
            </Button>
          </Link>
          <Link href="/register?type=provider">
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10 gap-2 h-14 px-8 text-base font-semibold rounded-xl"
            >
              <Wrench className="w-5 h-5" />
              Devino prestator
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
