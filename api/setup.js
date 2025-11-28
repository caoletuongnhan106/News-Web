require('dotenv').config();
const dbRepo = require('./modules/database/dbRepository');

async function setup() {
  console.log('Importing data from BlogData.json...');
  await dbRepo.importData();
  console.log('Import done!');
  process.exit(0);
}

setup();
