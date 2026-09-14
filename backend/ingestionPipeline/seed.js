import { ingest } from './main.js';
import { connectDB, getWeatherCollection, getIMDAlertsCollection } from './src/config/db.js';

export async function seedDatabase(cleanFirst = false) {
  console.log('🌱 [SEEDER] Initializing Weather Big Data Seeder...');
  await connectDB();

  if (cleanFirst) {
    const weatherCol = getWeatherCollection();
    const imdCol = getIMDAlertsCollection();
    if (weatherCol) await weatherCol.deleteMany({});
    if (imdCol) await imdCol.deleteMany({});
    console.log('🧹 [SEEDER] Cleared existing weather records.');
  }

  const result = await ingest();
  console.log('🎉 [SEEDER] Seeding complete with live weather data.');
  return result;
}

if (process.argv[1]?.endsWith('seed.js')) {
  const clean = process.argv.includes('--clean');
  seedDatabase(clean)
    .then(() => process.exit(0))
    .catch(err => {
      console.error('[SEEDER ERROR]', err);
      process.exit(1);
    });
}
