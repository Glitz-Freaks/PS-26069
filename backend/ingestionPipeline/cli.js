import * as p from '@clack/prompts';
import chalk from 'chalk';
import figlet from 'figlet';
import gradient from 'gradient-string';
import { ingest } from './main.js';
import { seedDatabase } from './seed.js';
import { translateToEnglish } from './src/translation/indicTranslator.js';
import { generateEmbedding } from './src/embedding/extractor.js';

async function main() {
  console.clear();
  console.log(
    gradient.morning(
      figlet.textSync('WEATHER CLI', { horizontalLayout: 'full' })
    )
  );
  console.log(chalk.cyan.bold('⚡ National Weather Ingestion & Analytics CLI Engine\n'));

  p.intro(chalk.bgCyan.black(' INGESTION CONTROL PANEL '));

  const action = await p.select({
    message: 'Select an operation to perform:',
    options: [
      { value: 'ingest', label: '🚀 Run Full Ingestion Pipeline (Scrape, Translate, Embed, Push)' },
      { value: 'seed_clean', label: '🌱 Reset & Seed Database with Fresh Data' },
      { value: 'test_translation', label: '🌐 Test Indic Multilingual Translation Engine' },
      { value: 'test_embedding', label: '🧠 Test On-Device Vector Embedding Generation' },
      { value: 'exit', label: '❌ Exit' }
    ]
  });

  if (p.isCancel(action) || action === 'exit') {
    p.outro(chalk.yellow('Session terminated.'));
    process.exit(0);
  }

  if (action === 'ingest') {
    const s = p.spinner();
    s.start('Running weather ingestion across India...');
    const result = await ingest();
    s.stop(chalk.green(`Ingestion complete! Clean events inserted: ${result.inserted}`));
  } else if (action === 'seed_clean') {
    const s = p.spinner();
    s.start('Cleaning and seeding fresh data into MongoDB...');
    await seedDatabase(true);
    s.stop(chalk.green('Database reset and seeded successfully!'));
  } else if (action === 'test_translation') {
    const text = await p.text({
      message: 'Enter Indic weather text (Hindi / Marathi / Tamil etc.):',
      placeholder: 'दादर में भारी बारिश से सड़कें जलमग्न हो गई हैं',
      initialValue: 'दादर में भारी बारिश से सड़कें जलमग्न हो गई हैं'
    });

    const s = p.spinner();
    s.start('Translating text...');
    const result = await translateToEnglish(text);
    s.stop(chalk.green('Translation result:'));
    console.log(chalk.yellow('Original:  '), text);
    console.log(chalk.cyan('Translated:'), result.translated_text);
    console.log(chalk.gray('Language:  '), result.language_name);
  } else if (action === 'test_embedding') {
    const text = await p.text({
      message: 'Enter text to vectorize:',
      initialValue: 'Severe waterlogging and traffic blockage at Dadar flyover'
    });

    const s = p.spinner();
    s.start('Extracting 384-dimensional dense vector...');
    const vec = await generateEmbedding(text);
    s.stop(chalk.green(`Vector generated! Dimensions: ${vec.length}`));
    console.log(chalk.gray('Preview: [' + vec.slice(0, 5).join(', ') + ' ... ' + vec.slice(-3).join(', ') + ']'));
  }

  p.outro(chalk.green('Operation completed successfully.'));
}

main().catch(err => {
  p.outro(chalk.red(`Fatal Error: ${err.message}`));
  process.exit(1);
});
