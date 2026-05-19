const db = require('./db');
const part1 = require('./data_part1');
const part2 = require('./data_part2');

const RAW_DATA = [...part1, ...part2];

const ITEMS = RAW_DATA.map(([id, name, country, region, description, imageUrl]) => ({
  id, name, country, region, description, imageUrl
}));

function seedDatabase() {
  const existing = db.prepare('SELECT COUNT(*) as count FROM items').get().count;

  if (existing >= ITEMS.length) {
    console.log('Database already seeded (' + existing + ' items). Skipping.');
    return;
  }

  console.log('Seeding database...');

  const upsert = db.prepare(
    'INSERT OR REPLACE INTO items (id, name, country, region, description, image_url) VALUES (?, ?, ?, ?, ?, ?)'
  );

  const upsertMany = db.transaction((items) => {
    for (const item of items) {
      upsert.run(item.id, item.name, item.country, item.region, item.description, item.imageUrl);
    }
  });

  upsertMany(ITEMS);
  console.log('Seeded ' + ITEMS.length + ' items successfully.');
}

seedDatabase();
