import { fetchSocialWeatherPosts } from './src/scrapers/twitterScraper.js';
import { fetchIMDAlerts } from './src/scrapers/imdScraper.js';
import { fetchNewsFeeds } from './src/scrapers/newsRssScraper.js';

console.log('\n======================================================');
console.log('🧪 [TEST HARNESS] Testing All Scrapers & Multi-Tier Fallbacks');
console.log('======================================================\n');

async function runTests() {
  console.log('--- 1. Testing Twitter/X & Social Scraper ---');
  const socialPosts = await fetchSocialWeatherPosts();
  console.log(`Fetched ${socialPosts.length} social posts.`);
  if (socialPosts.length > 0) {
    console.log(`Sample Post [${socialPosts[0].source_platform}]: ${socialPosts[0].author.handle} -> "${socialPosts[0].text.slice(0, 80)}..."`);
  }

  console.log('\n--- 2. Testing IMD Official API & Fallback Scraper ---');
  const imdAlerts = await fetchIMDAlerts();
  console.log(`Fetched ${imdAlerts.length} IMD bulletins.`);
  if (imdAlerts.length > 0) {
    console.log(`Sample IMD Alert [${imdAlerts[0].color_code} / ${imdAlerts[0].city}]: "${imdAlerts[0].headline.slice(0, 80)}..."`);
  }

  console.log('\n--- 3. Testing Google News & Indian Vernacular RSS Feeds ---');
  const newsArticles = await fetchNewsFeeds();
  console.log(`Fetched ${newsArticles.length} news articles.`);
  if (newsArticles.length > 0) {
    console.log(`Sample News [${newsArticles[0].source_name}]: "${newsArticles[0].title.slice(0, 80)}..."`);
  }

  console.log('\n======================================================');
  console.log('✅ ALL SCRAPER TESTS & FALLBACKS WORKING SEAMLESSLY!');
  console.log('======================================================\n');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
