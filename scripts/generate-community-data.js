import fs from 'fs';
import path from 'path';

// Генерує src/data/community.json перед білдом.
//
// Джерело даних (за пріоритетом):
// 1. Notion — база учасників (NOTION_TOKEN + NOTION_DATABASE_ID).
//    Беремо тільки тих, у кого Status = active і заповнена Location.
// 2. COMMUNITY_DATA — JSON-рядок у змінній середовища (старий спосіб, запасний).
//
// Для міст, яких немає у вбудованому списку координат у CommunityMap.tsx,
// координати визначаються через Mapbox Geocoding і зберігаються в полі `coordinates`.
//
// Токени використовуються тільки тут, на етапі білду, і не потрапляють у браузер.

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;
const MAPBOX_TOKEN = process.env.VITE_MAPBOX_ACCESS_TOKEN;
const COMMUNITY_DATA = process.env.COMMUNITY_DATA;

const OUTPUT = path.join(process.cwd(), 'src', 'data', 'community.json');

const plainText = (prop) =>
  (prop?.title ?? prop?.rich_text ?? []).map((t) => t.plain_text).join('').trim();

async function fetchFromNotion() {
  const members = [];
  let cursor;

  do {
    const res = await fetch(`https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        start_cursor: cursor,
        page_size: 100,
        filter: {
          and: [
            { property: 'Status', select: { equals: 'active' } },
            { property: 'Location', rich_text: { is_not_empty: true } },
          ],
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`Notion API ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    for (const page of data.results) {
      const p = page.properties;
      members.push({
        name: plainText(p.Name),
        location: plainText(p.Location),
        telegram: plainText(p.Telegram),
      });
    }
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);

  return members;
}

// Міста, координати яких уже захардкоджені в компоненті, повторно не геокодуємо.
function knownCities() {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'src', 'components', 'CommunityMap.tsx'),
    'utf8'
  );
  return new Set([...source.matchAll(/^\s*'([^']+)':\s*\[/gm)].map((m) => m[1]));
}

async function geocode(location) {
  const url =
    'https://api.mapbox.com/search/geocode/v6/forward' +
    `?q=${encodeURIComponent(location)}&types=place,locality&limit=1&access_token=${MAPBOX_TOKEN}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  return data.features?.[0]?.geometry?.coordinates ?? null;
}

async function addCoordinates(members) {
  if (!MAPBOX_TOKEN) return members;

  const known = knownCities();
  const unknown = [...new Set(members.map((m) => m.location))].filter((l) => !known.has(l));
  const coords = {};

  for (const location of unknown) {
    const c = await geocode(location);
    if (c) coords[location] = c;
    else console.warn(`⚠️  Не вдалося знайти координати для "${location}" — місто не з'явиться на карті`);
  }

  return members.map((m) => (coords[m.location] ? { ...m, coordinates: coords[m.location] } : m));
}

async function main() {
  let members;

  if (NOTION_TOKEN && NOTION_DATABASE_ID) {
    members = await fetchFromNotion();
    if (members.length === 0) {
      // Захист від порожньої карти, якщо щось не так з доступом або фільтром.
      throw new Error('Notion повернув 0 учасників — зупиняю білд, щоб не опублікувати порожню карту');
    }
    console.log(`Отримано ${members.length} активних учасників з Notion`);
  } else if (COMMUNITY_DATA) {
    members = JSON.parse(COMMUNITY_DATA);
    console.log(`Використано COMMUNITY_DATA (${members.length} учасників)`);
  } else {
    throw new Error('Не задано ні NOTION_TOKEN + NOTION_DATABASE_ID, ні COMMUNITY_DATA');
  }

  members = await addCoordinates(members);

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(members, null, 2));
  console.log('Successfully generated community.json');
}

main().catch((error) => {
  console.error('Error generating community.json:', error.message);
  process.exit(1);
});
