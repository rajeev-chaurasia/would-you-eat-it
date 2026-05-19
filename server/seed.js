const db = require('./db');
const part1 = require('./data_part1');
const part2 = require('./data_part2');

const RAW_DATA = [...part1, ...part2];

const ITEMS = RAW_DATA.map(([id, name, country, region, description, imageUrl]) => ({
  id, name, country, region, description, imageUrl
}));

function seedDatabase() {
  console.log('Syncing items to database...');

  // Use UPSERT so we update existing items (like new image URLs) without deleting rows and breaking foreign keys
  const upsert = db.prepare(`
    INSERT INTO items (id, name, country, region, description, image_url) 
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name,
      country=excluded.country,
      region=excluded.region,
      description=excluded.description,
      image_url=excluded.image_url
  `);

  const upsertMany = db.transaction((items) => {
    for (const item of items) {
      upsert.run(item.id, item.name, item.country, item.region, item.description, item.imageUrl);
    }
  });

  upsertMany(ITEMS);
  console.log('Synced ' + ITEMS.length + ' items successfully.');
}

seedDatabase();
