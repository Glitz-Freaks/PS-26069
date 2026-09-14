import Parser from 'rss-parser';
import { resolveLocationFromText } from '../lib/indianLocations.js';

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 MausamVani/1.0'
  },
  customFields: {
    item: ['media:content', 'enclosure']
  }
});

/**
 * 🌦️ 100% STRICT METEOROLOGICAL & DISASTER NEWS FEEDS
 * Curated exclusively for real-time weather alerts, floods, cyclones, and IMD bulletins.
 */
const LIVE_WEATHER_NEWS_FEEDS = [
  {
    name: "Google News UP & Lucknow (Severe Weather & IMD)",
    url: "https://news.google.com/rss/search?q=(Lucknow+OR+%22Uttar+Pradesh%22+OR+Kanpur+OR+Varanasi)+(weather+OR+rain+OR+monsoon+OR+flood+OR+thunderstorm+OR+fog+OR+IMD)&hl=en-IN&gl=IN&ceid=IN:en",
    lang: "en"
  },
  {
    name: "Google News Hindi UP (लखनऊ & उत्तर प्रदेश मौसम विभाग चेतावनी)",
    url: "https://news.google.com/rss/search?q=(%E0%A4%B2%E0%A4%96%E0%A4%A8%E0%A4%8A+OR+%22%E0%A4%89%E0%A4%A4%E0%A5%8D%E0%A4%A4%E0%A4%B0+%E0%A4%AA%E0%A5%8D%E0%A4%B0%E0%A4%A6%E0%A5%87%E0%A4%B6%22+OR+%E0%A4%95%E0%A4%BE%E0%A4%A8%E0%A4%AA%E0%A5%81%E0%A4%B0)+(%E0%A4%AE%E0%A5%8C%E0%A4%B8%E0%A4%AE+OR+%E0%A4%AC%E0%A4%BE%E0%A4%B0%E0%A4%BF%E0%A4%B6+OR+%E0%A4%86%E0%A4%82%E0%A4%A7%E0%A4%80+OR+%E0%A4%85%E0%A4%B2%E0%A4%B0%E0%A5%8D%E0%A4%9F+OR+IMD)&hl=hi&gl=IN&ceid=IN:hi",
    lang: "hi"
  },
  {
    name: "Google News India (IMD & Severe Weather)",
    url: "https://news.google.com/rss/search?q=IMD+weather+OR+rain+OR+flood+OR+cyclone+OR+cloudburst+india&hl=en-IN&gl=IN&ceid=IN:en",
    lang: "en"
  },
  {
    name: "Google News Hindi (मौसम & बारिश चेतावनी)",
    url: "https://news.google.com/rss/search?q=%E0%A4%AE%E0%A5%8C%E0%A4%B8%E0%A4%AE+%E0%A4%B5%E0%A4%BF%E0%A4%AD%E0%A4%BE%E0%A4%97+%E0%A4%9A%E0%A5%87%E0%A4%A4%E0%A4%BE%E0%A4%B5%E0%A4%A8%E0%A5%80+%E0%A4%AC%E0%A4%BE%E0%A4%B0%E0%A4%BF%E0%A4%B6+IMD&hl=hi&gl=IN&ceid=IN:hi",
    lang: "hi"
  },
  {
    name: "Google News India (Monsoon & Disaster Ground Reality)",
    url: "https://news.google.com/rss/search?q=(waterlogging+OR+inundated+OR+landslide+OR+heatwave+OR+thunderstorm)+india&hl=en-IN&gl=IN&ceid=IN:en",
    lang: "en"
  }
];

/**
 * Strict Meteorological Keyword Gate
 * Prevents non-weather news (politics, crime, sports, awards, education) from being ingested.
 */
const WEATHER_KEYWORDS = [
  'rain', 'rainfall', 'downpour', 'monsoon', 'cyclone', 'flood', 'flooding',
  'waterlogging', 'waterlogged', 'inundated', 'inundation', 'thunderstorm',
  'lightning', 'squall', 'cloudburst', 'heatwave', 'heat wave', 'coldwave',
  'cold wave', 'fog', 'dense fog', 'haze', 'storm', 'landslide', 'hailstorm',
  'hail', 'gusty winds', 'imd', 'weather', 'temperature', 'meteorological',
  'drought', 'reservoir level', 'nowcast', 'depression', 'low pressure',
  // Hindi & Indic
  'मौसम', 'बारिश', 'वर्षा', 'बाढ़', 'चक्रवात', 'आंधी', 'तूफान', 'लू',
  'कोहरा', 'बिजली', 'वज्रपात', 'भूस्खलन', 'मौसम विभाग', 'अलर्ट', 'आईएमडी',
  'मूसलाधार', 'जलभराव', 'बादल फटा'
];

function isStrictlyWeatherRelated(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return WEATHER_KEYWORDS.some(keyword => lower.includes(keyword));
}

export async function fetchNewsFeeds() {
  const verifiedWeatherArticles = [];

  for (const feed of LIVE_WEATHER_NEWS_FEEDS) {
    try {
      const parsed = await parser.parseURL(feed.url);
      const items = parsed.items || [];

      for (const item of items.slice(0, 10)) {
        const title = item.title || '';
        const snippet = item.contentSnippet || item.content || '';
        const fullContent = `${title} ${snippet}`;

        // STRICT FILTER: Discard any non-weather / random news
        if (!isStrictlyWeatherRelated(fullContent)) {
          continue;
        }

        const loc = resolveLocationFromText(fullContent);

        // Extract thumbnail image if present
        let imageUrl = item.enclosure?.url || item['media:content']?.$?.url;
        if (!imageUrl) {
          imageUrl = "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=800&auto=format&fit=crop&q=80";
        }

        verifiedWeatherArticles.push({
          source_type: 'news',
          source_name: feed.name,
          title: title,
          summary: snippet,
          landmark: loc.landmark,
          city: loc.city,
          district: loc.district,
          state: loc.state,
          coordinates: loc.coordinates,
          image_url: imageUrl,
          source_url: item.link || item.guid,
          timestamp: item.pubDate ? new Date(item.pubDate) : new Date()
        });
      }
    } catch (err) {
      console.warn(`[NEWS SCRAPER] Live RSS fetch for ${feed.name} note:`, err.message);
    }
  }

  return verifiedWeatherArticles;
}
