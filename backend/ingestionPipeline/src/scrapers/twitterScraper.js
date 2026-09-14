import axios from 'axios';
import Parser from 'rss-parser';
import { resolveLocationFromText } from '../lib/indianLocations.js';

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 MausamVani/1.0'
  }
});

/**
 * 🐦 TWITTER / X & SOCIAL MEDIA INGESTION ENGINE
 * 
 * PRIMARY: Official Twitter / X Developer API v2 (api.twitter.com)
 * FALLBACK 1: Real-time Reddit Indian City Feeds (r/mumbai, r/delhi, r/bangalore, r/chennai, r/hyderabad, r/kolkata, r/kerala, r/india)
 * FALLBACK 2: Mastodon Fediverse #Weather & #Monsoon Public Timelines
 */

const REDDIT_COMMUNITIES = [
  { name: 'r/lucknow', url: 'https://www.reddit.com/r/lucknow/search.rss?q=rain+OR+weather+OR+waterlogging+OR+flood+OR+IMD&restrict_sr=on&sort=new' },
  { name: 'r/uttarpradesh', url: 'https://www.reddit.com/r/uttarpradesh/search.rss?q=rain+OR+weather+OR+flood+OR+monsoon+OR+IMD&restrict_sr=on&sort=new' },
  { name: 'r/mumbai', url: 'https://www.reddit.com/r/mumbai/search.rss?q=rain+OR+flood+OR+weather+OR+waterlogging+OR+IMD&restrict_sr=on&sort=new' },
  { name: 'r/delhi', url: 'https://www.reddit.com/r/delhi/search.rss?q=rain+OR+weather+OR+flood+OR+waterlogging+OR+IMD&restrict_sr=on&sort=new' },
  { name: 'r/bangalore', url: 'https://www.reddit.com/r/bangalore/search.rss?q=rain+OR+weather+OR+flood+OR+waterlogging&restrict_sr=on&sort=new' },
  { name: 'r/chennai', url: 'https://www.reddit.com/r/chennai/search.rss?q=rain+OR+weather+OR+flood+OR+cyclone&restrict_sr=on&sort=new' },
  { name: 'r/hyderabad', url: 'https://www.reddit.com/r/hyderabad/search.rss?q=rain+OR+weather+OR+flood&restrict_sr=on&sort=new' },
  { name: 'r/kolkata', url: 'https://www.reddit.com/r/kolkata/search.rss?q=rain+OR+weather+OR+cyclone&restrict_sr=on&sort=new' },
  { name: 'r/kerala', url: 'https://www.reddit.com/r/kerala/search.rss?q=rain+OR+flood+OR+landslide+OR+weather&restrict_sr=on&sort=new' },
  { name: 'r/india', url: 'https://www.reddit.com/r/india/search.rss?q=rain+OR+weather+OR+IMD+OR+cyclone+OR+flood&restrict_sr=on&sort=new' }
];

const MASTODON_WEATHER_TAGS = ['weather', 'imd', 'monsoon', 'lucknow', 'lucknowrains', 'uprains', 'mumbairains', 'chennairains'];

/**
 * 1. PRIMARY: Query Official Twitter/X API v2
 * Uses recent search endpoint to extract verified posts, geotags, and media.
 */
async function fetchFromOfficialTwitterAPI() {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;
  if (!bearerToken || bearerToken.trim() === '') {
    return null;
  }

  console.log('🐦 [TWITTER API] Attempting to query Official Twitter/X API v2 (api.twitter.com)...');

  try {
    const weatherQuery = '(rain OR flood OR weather OR cyclone OR waterlogging OR IMD OR thunderstorm) (lucknow OR "uttar pradesh" OR mumbai OR delhi OR bangalore OR chennai OR hyderabad OR kolkata OR kerala OR pune OR kanpur OR varanasi) -is:retweet lang:en';
    
    const response = await axios.get('https://api.twitter.com/2/tweets/search/recent', {
      headers: {
        'Authorization': `Bearer ${bearerToken.trim()}`,
        'User-Agent': 'MausamVani-DisasterAnalytics/1.0'
      },
      params: {
        'query': weatherQuery,
        'max_results': 20,
        'tweet.fields': 'created_at,author_id,entities,geo,public_metrics',
        'expansions': 'attachments.media_keys,author_id,geo.place_id',
        'media.fields': 'url,preview_image_url,type',
        'user.fields': 'username,name,verified'
      },
      timeout: 7000
    });

    const tweets = response.data?.data || [];
    if (tweets.length === 0) {
      console.log('🐦 [TWITTER API] 0 matching tweets found in recent window.');
      return null;
    }

    // Index attached media
    const mediaMap = {};
    (response.data?.includes?.media || []).forEach(m => {
      mediaMap[m.media_key] = m.url || m.preview_image_url;
    });

    // Index authors
    const userMap = {};
    (response.data?.includes?.users || []).forEach(u => {
      userMap[u.id] = {
        username: u.username,
        is_verified: !!u.verified
      };
    });

    const liveTweets = [];
    for (const tweet of tweets) {
      const loc = resolveLocationFromText(tweet.text);
      const mediaKey = tweet.attachments?.media_keys?.[0];
      const mediaUrl = mediaMap[mediaKey] || 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=800&auto=format&fit=crop&q=80';
      const user = userMap[tweet.author_id] || { username: 'citizen', is_verified: false };

      liveTweets.push({
        source_type: 'social_media',
        source_platform: 'twitter',
        source_url: `https://twitter.com/i/web/status/${tweet.id}`,
        author: {
          handle: `@${user.username}`,
          is_verified: user.is_verified
        },
        text: tweet.text,
        landmark: loc.landmark,
        city: loc.city,
        district: loc.district,
        state: loc.state,
        coordinates: loc.coordinates,
        image_url: mediaUrl,
        timestamp: tweet.created_at ? new Date(tweet.created_at) : new Date()
      });
    }

    console.log(`✅ [TWITTER API] Successfully fetched ${liveTweets.length} live tweets from Twitter/X v2.`);
    return liveTweets;
  } catch (err) {
    if (err.response?.status === 401) {
      console.warn('⚠️ [TWITTER API 401] Invalid or expired TWITTER_BEARER_TOKEN. Falling back to open social streams.');
    } else if (err.response?.status === 429) {
      console.warn('⚠️ [TWITTER API 429] Rate limit reached on Twitter API. Falling back to open social streams.');
    } else {
      console.warn('⚠️ [TWITTER API ERROR]', err.response?.data?.title || err.message, '-> Switching to fallback streams.');
    }
  }

  return null;
}

/**
 * 2. FALLBACK: Real-time Open Social Media Streams (Reddit City Feeds + Mastodon Fediverse)
 */
async function fetchFromSocialFallbacks() {
  console.log('🔄 [SOCIAL FALLBACK] Fetching live weather reports from Reddit India & Mastodon Fediverse...');
  const fallbackPosts = [];

  // Step A: Reddit Indian City RSS
  for (const feed of REDDIT_COMMUNITIES) {
    try {
      const parsed = await parser.parseURL(feed.url);
      const items = parsed.items || [];

      for (const item of items.slice(0, 3)) {
        const title = item.title || '';
        const content = item.contentSnippet || item.content || '';
        const fullText = `${title} ${content}`;
        const loc = resolveLocationFromText(fullText);

        // Extract attached image
        let imageUrl = null;
        const imgMatch = item.content?.match(/src="([^"]+\.(?:jpg|png|webp|jpeg)[^"]*)"/i);
        if (imgMatch) {
          imageUrl = imgMatch[1];
        }

        fallbackPosts.push({
          source_type: 'social_media',
          source_platform: feed.name,
          source_url: item.link,
          author: {
            handle: item.author || feed.name,
            is_verified: false
          },
          text: title + (content ? ` - ${content.slice(0, 200)}` : ''),
          landmark: loc.landmark,
          city: loc.city,
          district: loc.district,
          state: loc.state,
          coordinates: loc.coordinates,
          image_url: imageUrl || "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=800&auto=format&fit=crop&q=80",
          timestamp: item.pubDate ? new Date(item.pubDate) : new Date()
        });
      }
    } catch {
      // Graceful per-subreddit continue
    }
  }

  // Step B: Mastodon Fediverse Weather Network
  for (const tag of MASTODON_WEATHER_TAGS) {
    try {
      const res = await axios.get(`https://mastodon.social/api/v1/timelines/tag/${tag}`, {
        headers: { 'User-Agent': 'MausamVani/1.0' },
        timeout: 4000
      });
      const items = res.data || [];
      for (const item of items.slice(0, 3)) {
        const cleanContent = (item.content || '').replace(/<[^>]*>/g, '');
        if (cleanContent.length < 15) continue;

        const loc = resolveLocationFromText(cleanContent);
        fallbackPosts.push({
          source_type: 'social_media',
          source_platform: 'fediverse',
          source_url: item.url,
          author: { handle: `@${item.account?.username}`, is_verified: false },
          text: cleanContent.slice(0, 250),
          landmark: loc.landmark,
          city: loc.city,
          district: loc.district,
          state: loc.state,
          coordinates: loc.coordinates,
          image_url: item.media_attachments?.[0]?.url || "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800&auto=format&fit=crop&q=80",
          timestamp: new Date(item.created_at)
        });
      }
    } catch {
      // Graceful continue
    }
  }

  console.log(`✅ [SOCIAL FALLBACK] Ingested ${fallbackPosts.length} live ground weather posts.`);
  return fallbackPosts;
}

/**
 * Main Scraper Method
 */
export async function fetchSocialWeatherPosts() {
  // 1. Try Official Twitter/X API v2
  const officialTweets = await fetchFromOfficialTwitterAPI();
  if (officialTweets && officialTweets.length > 0) {
    return officialTweets;
  }

  // 2. Fallback to Open Social Streams (Reddit + Mastodon)
  return await fetchFromSocialFallbacks();
}
