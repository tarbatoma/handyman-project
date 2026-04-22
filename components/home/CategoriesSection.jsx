import Link from 'next/link'
import { SERVICE_CATEGORIES } from '@/lib/constants'

export default function CategoriesSection() {
  return (
    <section className="py-20 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Categorii de servicii
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            De la reparații simple la renovări complete — găsești expertul potrivit
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {SERVICE_CATEGORIES.map((cat, index) => (
            <Link
              key={cat.slug}
              href={`/providers?category=${cat.slug}`}
              className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 card-hover text-center"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="text-3xl group-hover:scale-110 transition-transform duration-200">
                {cat.icon}
              </div>
              <span className="text-sm font-medium text-foreground leading-tight">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/providers"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
          >
            Vezi toți prestatorii →
          </Link>
        </div>
      </div>
    </section>
  )
}
