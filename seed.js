const admin = require('firebase-admin');
const serviceAccount = require('/Users/blueice/Downloads/handyman-project-8a128-firebase-adminsdk-fbsvc-968a6227b6.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const SECTORS = [
  { name: 'Sector 1', slug: 'sector-1' },
  { name: 'Sector 2', slug: 'sector-2' },
  { name: 'Sector 3', slug: 'sector-3' },
  { name: 'Sector 4', slug: 'sector-4' },
  { name: 'Sector 5', slug: 'sector-5' },
  { name: 'Sector 6', slug: 'sector-6' },
];

const SERVICE_CATEGORIES = [
  { name: 'Zugrav', slug: 'zugrav', icon: '🎨', sort_order: 1 },
  { name: 'Instalator', slug: 'instalator', icon: '🔧', sort_order: 2 },
  { name: 'Electrician', slug: 'electrician', icon: '⚡', sort_order: 3 },
  { name: 'Montaj mobilă', slug: 'montaj-mobila', icon: '🪑', sort_order: 4 },
  { name: 'Curățenie', slug: 'curatenie', icon: '🧹', sort_order: 5 },
  { name: 'Gresie / Faianță', slug: 'gresie-faianta', icon: '🏗️', sort_order: 6 },
  { name: 'Reparații diverse', slug: 'reparatii-diverse', icon: '🛠️', sort_order: 7 },
  { name: 'Amenajări interioare', slug: 'amenajari-interioare', icon: '🏠', sort_order: 8 },
  { name: 'Transport / Mutări', slug: 'transport-mutari', icon: '🚛', sort_order: 9 },
  { name: 'Tâmplărie', slug: 'tamplarie', icon: '🪚', sort_order: 10 },
  { name: 'Aer condiționat', slug: 'aer-conditionat', icon: '❄️', sort_order: 11 },
  { name: 'Centrale termice', slug: 'centrale-termice', icon: '🔥', sort_order: 12 },
];

async function seed() {
  console.log('Seeding areas...');
  const batch = db.batch();
  
  SECTORS.forEach(sector => {
    const docRef = db.collection('areas').doc(sector.slug);
    batch.set(docRef, sector);
  });

  console.log('Seeding categories...');
  SERVICE_CATEGORIES.forEach(cat => {
    const docRef = db.collection('service_categories').doc(cat.slug);
    batch.set(docRef, cat);
  });

  await batch.commit();
  console.log('Done seeding!');
}

seed().catch(console.error);
