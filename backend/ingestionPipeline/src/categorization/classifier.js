/**
 * Weather Event Categories & Severity Classification Engine
 */

export const CATEGORIES = {
  FLOODING: ['flood', 'waterlogging', 'submerged', 'water logged', 'water accumulation', 'drowning', 'overflow', 'जलभराव', 'बाढ़', 'வெள்ளம்'],
  RAINFALL: ['rain', 'rainfall', 'downpour', 'cloudburst', 'monsoon', 'drizzle', 'shower', 'बारिश', 'पाऊस', 'மழை'],
  THUNDERSTORM: ['thunderstorm', 'lightning', 'thunder', 'squall', 'बिजली', 'वादळ', 'இடி மின்னல்'],
  CYCLONE: ['cyclone', 'gale', 'hurricane', 'typhoon', 'landfall', 'चक्रवात', 'புயல்'],
  HEATWAVE: ['heatwave', 'extreme heat', 'loo', 'high temperature', 'लू', 'வெப்ப அலை'],
  FOG: ['dense fog', 'fog', 'smog', 'zero visibility', 'कोहरा', 'धुके', 'மூடுபனி'],
  DUST_STORM: ['dust storm', 'andhi', 'sandstorm', 'आंधी'],
  LANDSLIDE: ['landslide', 'mudslide', 'debris flow', 'rockfall', 'भूस्खलन'],
  HAILSTORM: ['hailstorm', 'hail', 'ice pellets', 'ओलावृष्टि']
};

export function classifyWeatherEvent(text) {
  if (!text) return { category: 'RAINFALL', severity: 'MODERATE', matched_keywords: [] };

  const lower = text.toLowerCase();
  const matchedCategories = [];

  for (const [category, keywords] of Object.entries(CATEGORIES)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        matchedCategories.push({ category, keyword: kw });
        break;
      }
    }
  }

  const primaryCategory = matchedCategories.length > 0 ? matchedCategories[0].category : 'RAINFALL';
  const severity = calculateSeverity(lower, primaryCategory);

  return {
    category: primaryCategory,
    categories: matchedCategories.map(m => m.category),
    severity: severity.level,
    severity_score: severity.score,
    matched_keywords: matchedCategories.map(m => m.keyword)
  };
}

function calculateSeverity(text, category) {
  let score = 40; // baseline moderate

  // Critical indicators
  if (
    text.includes('red alert') ||
    text.includes('cloudburst') ||
    text.includes('flash flood') ||
    text.includes('evacuat') ||
    text.includes('stranded') ||
    text.includes('submerged') ||
    text.includes('loss of life') ||
    text.includes('danger mark')
  ) {
    return { level: 'CRITICAL', score: 95 };
  }

  // High indicators
  if (
    text.includes('orange alert') ||
    text.includes('heavy rain') ||
    text.includes('waterlogging') ||
    text.includes('traffic halted') ||
    text.includes('uprooted') ||
    text.includes('severe')
  ) {
    return { level: 'HIGH', score: 75 };
  }

  // Low indicators
  if (
    text.includes('light rain') ||
    text.includes('drizzle') ||
    text.includes('scattered') ||
    text.includes('normal')
  ) {
    return { level: 'LOW', score: 20 };
  }

  return { level: 'MODERATE', score: 50 };
}

export function computeTrustScore(source, isVerifiedAuthor, hasMedia, hasIMDReference) {
  let score = 50;

  if (source === 'imd') score += 45;
  if (source === 'news') score += 35;
  if (source === 'citizen') score += 20;
  if (source === 'twitter') score += 15;

  if (isVerifiedAuthor) score += 10;
  if (hasMedia) score += 15;
  if (hasIMDReference) score += 15;

  return Math.min(100, score);
}
