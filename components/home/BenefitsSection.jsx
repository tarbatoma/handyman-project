const clientBenefits = [
  { icon: '⚡', text: 'Găsești rapid un meseriaș disponibil' },
  { icon: '⭐', text: 'Recenzii reale de la clienți verificați' },
  { icon: '💬', text: 'Comunicare directă cu prestatorul' },
  { icon: '🔒', text: 'Platformă sigură și transparentă' },
  { icon: '💰', text: 'Prețuri clare și negociabile' },
  { icon: '📍', text: 'Filtrare după sectorul tău' },
]

const providerBenefits = [
  { icon: '📈', text: 'Vizibilitate crescută în față clienților' },
  { icon: '📩', text: 'Primești cereri direct pe platformă' },
  { icon: '🆓', text: 'Înregistrare gratuită' },
  { icon: '🖼️', text: 'Portofoliu vizibil publicului' },
  { icon: '⭐', text: 'Construiești reputație prin recenzii' },
  { icon: '📊', text: 'Dashboard cu statistici proprii' },
]

export default function BenefitsSection() {
  return (
    <section className="py-20 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            De ce MeșterHub?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Client benefits */}
          <div className="rounded-2xl border border-border p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-3xl">👤</div>
              <div>
                <h3 className="font-bold text-xl text-foreground">Pentru clienți</h3>
                <p className="text-muted-foreground text-sm">Găsești rapid ce cauți</p>
              </div>
            </div>
            <ul className="space-y-3">
              {clientBenefits.map((b) => (
                <li key={b.text} className="flex items-center gap-3 text-sm text-foreground">
                  <span className="text-lg">{b.icon}</span>
                  {b.text}
                </li>
              ))}
            </ul>
            <a
              href="/search"
              className="mt-8 inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              Caută un meseriaș →
            </a>
          </div>

          {/* Provider benefits */}
          <div className="rounded-2xl border border-border p-8 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-3xl">🔧</div>
              <div>
                <h3 className="font-bold text-xl text-foreground">Pentru prestatori</h3>
                <p className="text-muted-foreground text-sm">Crești afacerea local</p>
              </div>
            </div>
            <ul className="space-y-3">
              {providerBenefits.map((b) => (
                <li key={b.text} className="flex items-center gap-3 text-sm text-foreground">
                  <span className="text-lg">{b.icon}</span>
                  {b.text}
                </li>
              ))}
            </ul>
            <a
              href="/register?type=provider"
              className="mt-8 inline-flex items-center gap-2 bg-amber-500 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-amber-600 transition-colors"
            >
              Devino prestator →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
