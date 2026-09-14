/**
 * Dynamic Warning Severity Percentage Calculator (0-100%)
 * 
 * Formula:
 * W = min(100, 0.40 * S_imd + 0.25 * S_vel + 0.15 * S_key + 0.20 * S_vis)
 */

export function calculateWarningPercentage(activeIMDAlert, eventsInDistrict = [], timeWindowHours = 2) {
  // 1. Official IMD Warning Component (40% Weight)
  let imdScore = 0;
  if (activeIMDAlert) {
    const color = activeIMDAlert.color_code?.toUpperCase();
    if (color === 'RED') imdScore = 100;
    else if (color === 'ORANGE') imdScore = 75;
    else if (color === 'YELLOW') imdScore = 40;
    else imdScore = 10;
  }

  // 2. Social Media Velocity Component (25% Weight)
  // Number of reports in the past time window compared to baseline
  const recentEvents = eventsInDistrict.filter(e => {
    const diffHours = (Date.now() - new Date(e.timestamps?.event_time || e.createdAt).getTime()) / (1000 * 60 * 60);
    return diffHours <= timeWindowHours;
  });

  const postCount = recentEvents.length;
  // 15+ posts in 2 hours = 100% velocity score
  const velocityScore = Math.min(100, (postCount / 10) * 100);

  // 3. Urgency Keyword Density Component (15% Weight)
  const urgentKeywords = ['cloudburst', 'submerged', 'flash flood', 'stranded', 'evacuat', 'red alert', 'danger mark', 'tree uprooted'];
  let keywordMatches = 0;

  for (const e of recentEvents) {
    const text = ((e.translated_text || '') + ' ' + (e.original_text || '')).toLowerCase();
    for (const kw of urgentKeywords) {
      if (text.includes(kw)) keywordMatches++;
    }
  }
  const keywordScore = Math.min(100, (keywordMatches / 5) * 100);

  // 4. Visual Proof & Photo Confirmation Component (20% Weight)
  const photosCount = recentEvents.filter(e => e.image_url || (e.media && e.media.length > 0)).length;
  // 3+ photo reports = 100% visual score
  const visualScore = Math.min(100, (photosCount / 3) * 100);

  // Weighted sum
  const finalPercentage = Number(
    Math.min(
      100,
      0.40 * imdScore +
      0.25 * velocityScore +
      0.15 * keywordScore +
      0.20 * visualScore
    ).toFixed(1)
  );

  let warningLevel = 'LOW';
  let colorCode = 'GREEN';
  let advisory = 'Normal weather conditions. No immediate threat reported.';

  if (finalPercentage >= 80) {
    warningLevel = 'CRITICAL_DISASTER';
    colorCode = 'RED';
    advisory = 'Extreme danger! Red Alert conditions detected with active flooding/landslides. Avoid low-lying areas.';
  } else if (finalPercentage >= 60) {
    warningLevel = 'HIGH_RISK';
    colorCode = 'ORANGE';
    advisory = 'High risk! Intense weather activity with traffic disruption and localized waterlogging.';
  } else if (finalPercentage >= 30) {
    warningLevel = 'MODERATE';
    colorCode = 'YELLOW';
    advisory = 'Moderate weather alert. Light to moderate rain, exercise caution during commute.';
  }

  return {
    warning_percentage: finalPercentage,
    warning_level: warningLevel,
    color_code: colorCode,
    advisory: advisory,
    metrics: {
      imd_score: imdScore,
      velocity_score: Number(velocityScore.toFixed(1)),
      keyword_score: Number(keywordScore.toFixed(1)),
      visual_score: Number(visualScore.toFixed(1)),
      total_reports_count: postCount,
      photo_evidence_count: photosCount
    }
  };
}
