function isoDate(year, month, day) {
  const date = new Date(Date.UTC(+year, +month - 1, +day));
  return date.getUTCFullYear() === +year && date.getUTCMonth() === +month - 1 && date.getUTCDate() === +day
    ? date.toISOString().slice(0, 10) : null;
}

export function parseEventDates(value, year = 2026) {
  const text = String(value ?? '').replace(/\s+/g, '').replace(/週[一二三四五六日天]/g, '');
  const match = text.match(/^(?:(\d{4})年)?(\d{1,2})月(\d{1,2})(?:及(\d{1,2}))?日(?:至(?:(\d{4})年)?(?:(\d{1,2})月)?(\d{1,2})日)?$/);
  if (!match) return [];
  const [, y, m, d, otherDay, endYear, endMonth, endDay] = match;
  const startsOn = isoDate(y || year, m, d);
  const endsOn = endDay ? isoDate(endYear || y || year, endMonth || m, endDay) : startsOn;
  if (!startsOn || !endsOn || endsOn < startsOn || (otherDay && endDay)) return [];
  if (otherDay) {
    const second = isoDate(y || year, m, otherDay);
    return second ? [{ startsOn, endsOn: startsOn }, { startsOn: second, endsOn: second }] : [];
  }
  return [{ startsOn, endsOn }];
}

function absoluteUrl(value, source) {
  try { return new URL(value, source.url).href; } catch { return null; }
}

function localDay(value) {
  const match = value.match(/(\d{4})-(\d{2})-(\d{2})|(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) return null;
  const day = match[1] ? isoDate(match[1], match[2], match[3]) : isoDate(match[6], match[5], match[4]);
  return day ? `${day}T00:00:00+08:00` : null;
}

export function parseRegionalNews(html, source, cleanText) {
  const entries = [];
  if (source.type === 'icm-news' || source.kind === 'icm-news' || source.id === 'icm-news') {
    const pattern = /<h5\b[^>]*class=['"][^'"]*\bnewsTitleTxt\b[^'"]*['"][^>]*>([\s\S]*?)<\/h5>\s*<div\b[^>]*class=['"][^'"]*\bgrayTxt\b[^'"]*['"][^>]*>([\s\S]*?)<\/div>/gi;
    for (const match of html.matchAll(pattern)) {
      const link = match[1].match(/<a\b[^>]*href=['"]([^'"]+)['"][^>]*>([\s\S]*?)<\/a>/i);
      if (!link) continue;
      const publishedAt = localDay(cleanText(match[2], 100));
      const url = absoluteUrl(link[1], source);
      if (publishedAt && url) entries.push({ title: cleanText(link[2], 500), url, publishedAt, datePrecision: 'day' });
    }
  } else {
    for (const match of html.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)) {
      const link = match[1].match(/<a\b([^>]*href=['"]([^'"]*\/content\/post_[^'"]+)['"][^>]*)>([\s\S]*?)<\/a>/i);
      if (!link) continue;
      const publishedAt = localDay(cleanText(match[1], 2000));
      const title = link[1].match(/\btitle=['"]([^'"]+)['"]/i)?.[1] || link[3];
      const url = absoluteUrl(link[2], source);
      if (publishedAt && url) entries.push({ title: cleanText(title, 500), url, publishedAt, datePrecision: 'day' });
    }
  }
  return entries;
}

export function parseEventTable(html, source, cleanText) {
  const events = [];
  for (const table of html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi)) {
    if (/\b(?:rowspan|colspan)\s*=/i.test(table[1])) continue;
    const rows = [...table[1].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)]
      .map(row => [...row[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(cell => cleanText(cell[1], 3000)));
    if (!rows.length || rows[0].length !== 5 || !/日期/.test(rows[0][0]) || !/活動名稱/.test(rows[0][2])) continue;
    for (const cells of rows.slice(1)) {
      if (cells.length !== 5) continue;
      const [dateText, timeText, title, venue, registrationText] = cells;
      for (const dates of parseEventDates(dateText, source.year || 2026)) {
        events.push({ title, url: source.url, ...dates, timeText, venue, registrationText, publishedAt: source.publishedAt || null });
      }
    }
  }
  return events;
}

export function parseCalendarEvents(entries, source, cleanText) {
  const events = [];
  const seen = new Set();
  for (const entry of entries) {
    const summary = cleanText(entry.summary, 50000);
    const prefix = summary.match(/^\[([^\]]+)\]/)?.[1];
    if (!prefix) continue;
    const url = absoluteUrl(entry.url, source);
    if (!url) continue;
    const title = cleanText(entry.title, 220);
    for (const dates of parseEventDates(prefix, source.year || 2026)) {
      const key = `${url}|${title}|${dates.startsOn}|${dates.endsOn}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const venue = summary.match(/地點[：:]\s*(.*?)(?=地址[：:]|活動日期|$)/)?.[1]?.trim() || '';
      events.push({
        ...entry, title, url, ...dates, venue,
        timeText: '具体场次与开放时间以原文为准', registrationText: '',
      });
    }
  }
  return events;
}
