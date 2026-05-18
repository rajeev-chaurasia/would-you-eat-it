const db = require('./db');
const part1 = require('./data_part1');
const part2 = require('./data_part2');

const RAW_DATA = [...part1, ...part2];

const ITEMS = RAW_DATA.map(([id, name, country, region, description, imageUrl]) => ({
  id, name, country, region, description, imageUrl
}));

function seedDatabase() {
  console.log('Seeding database...');

  const insert = db.prepare(
    'INSERT INTO items (id, name, country, region, description, image_url) VALUES (?, ?, ?, ?, ?, ?)'
  );

  const insertMany = db.transaction((items) => {
    for (const item of items) {
      insert.run(item.id, item.name, item.country, item.region, item.description, item.imageUrl);
    }
  });

  try {
    db.exec('DELETE FROM votes');
    db.exec('DELETE FROM items');
    insertMany(ITEMS);
    console.log(`Seeded ${ITEMS.length} items successfully.`);
  } catch (err) {
    console.error('Failed to seed database:', err);
  }
}

seedDatabase();
