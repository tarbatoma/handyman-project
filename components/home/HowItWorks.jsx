const steps = [
  {
    step: '01',
    title: 'Caută un serviciu',
    desc: 'Alege categoria de care ai nevoie și selectează sectorul din București.',
    icon: '🔍',
  },
  {
    step: '02',
    title: 'Compară prestatori',
    desc: 'Vezi profiluri detaliate, recenzii reale și prețuri orientative.',
    icon: '📋',
  },
  {
    step: '03',
    title: 'Trimite o cerere',
    desc: 'Contactează direct prestatorul și descrie ce ai nevoie.',
    icon: '📩',
  },
  {
    step: '04',
    title: 'Lucrare finalizată',
    desc: 'Prestatorul realizează lucrarea. Lasă o recenzie după finalizare!',
    icon: '✅',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Cum funcționează?
          </h2>
          <p className="text-muted-foreground text-lg">
            În 4 pași simpli, ai meseriașul perfect la tine acasă
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, idx) => (
            <div key={item.step} className="relative flex flex-col items-center text-center">
              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] h-0.5 bg-primary/20" />
              )}

              {/* Icon */}
              <div className="relative w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl mb-5 border-2 border-primary/20">
                {item.icon}
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
              </div>

              <h3 className="font-semibold text-foreground text-lg mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
