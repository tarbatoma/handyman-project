import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Andrei Popescu',
    role: 'Client',
    avatar: '👨‍💼',
    text: 'Am găsit un zugrav excelent în 30 de minute. A venit a doua zi și a terminat toată lucrarea în 2 zile. Recomand 100%!',
    rating: 5,
    service: 'Zugravit apartament',
  },
  {
    name: 'Maria Ionescu',
    role: 'Client',
    avatar: '👩‍💼',
    text: 'Platforma m-a ajutat enorm să găsesc un instalator disponibil rapid. Prețul a fost corect și lucrarea impecabilă.',
    rating: 5,
    service: 'Instalatii sanitare',
  },
  {
    name: 'Mihai Constantin',
    role: 'Prestator',
    avatar: '👷',
    text: 'De când m-am înregistrat pe MeșterHub, am primit constant cereri noi. Este cea mai bună decizie pentru afacerea mea.',
    rating: 5,
    service: 'Electrician autorizat',
  },
]

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
        />
      ))}
    </div>
  )
}

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Ce spun utilizatorii noștri
          </h2>
          <p className="text-muted-foreground text-lg">
            Mii de lucrări realizate cu succes în București
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-border p-6 shadow-sm card-hover"
            >
              <StarRating rating={t.rating} />
              <p className="text-foreground text-sm leading-relaxed mt-4 mb-6">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {t.role} · {t.service}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
