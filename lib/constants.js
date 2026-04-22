export const SECTORS = [
  { id: 'sector-1', name: 'Sector 1', slug: 'sector-1' },
  { id: 'sector-2', name: 'Sector 2', slug: 'sector-2' },
  { id: 'sector-3', name: 'Sector 3', slug: 'sector-3' },
  { id: 'sector-4', name: 'Sector 4', slug: 'sector-4' },
  { id: 'sector-5', name: 'Sector 5', slug: 'sector-5' },
  { id: 'sector-6', name: 'Sector 6', slug: 'sector-6' },
]

export const SERVICE_CATEGORIES = [
  { name: 'Zugrav', slug: 'zugrav', icon: '🎨' },
  { name: 'Instalator', slug: 'instalator', icon: '🔧' },
  { name: 'Electrician', slug: 'electrician', icon: '⚡' },
  { name: 'Montaj mobilă', slug: 'montaj-mobila', icon: '🪑' },
  { name: 'Curățenie', slug: 'curatenie', icon: '🧹' },
  { name: 'Gresie / Faianță', slug: 'gresie-faianta', icon: '🏗️' },
  { name: 'Reparații diverse', slug: 'reparatii-diverse', icon: '🛠️' },
  { name: 'Amenajări interioare', slug: 'amenajari-interioare', icon: '🏠' },
  { name: 'Transport / Mutări', slug: 'transport-mutari', icon: '🚛' },
  { name: 'Tâmplărie', slug: 'tamplarie', icon: '🪚' },
  { name: 'Aer condiționat', slug: 'aer-conditionat', icon: '❄️' },
  { name: 'Centrale termice', slug: 'centrale-termice', icon: '🔥' },
]

export const REQUEST_STATUSES = {
  new: { label: 'Nou', color: 'blue' },
  in_progress: { label: 'În discuție', color: 'yellow' },
  completed: { label: 'Finalizat', color: 'green' },
  rejected: { label: 'Respins', color: 'red' },
}

export const USER_ROLES = {
  client: 'client',
  provider: 'provider',
  admin: 'admin',
}
