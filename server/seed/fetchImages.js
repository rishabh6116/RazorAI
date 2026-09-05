// Fetches a real, correctly-matching stock photo for every product from the
// Pexels API (free, legal for commercial use, no attribution required) and
// writes the result to seed/imageMap.json. seedProducts.js then reads that
// map so every product shows its actual correct photo.
//
// Run this ONCE locally:  node seed/fetchImages.js
// Requires PEXELS_API_KEY in server/.env

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.PEXELS_API_KEY;
if (!API_KEY) {
  console.error('Missing PEXELS_API_KEY in server/.env');
  process.exit(1);
}

// seed -> search query. Products sharing a query get different pages so they
// don't all end up with the same photo.
const PRODUCTS = [
  ['aspire3', 'laptop'],
  ['pavilion14', 'laptop'],
  ['ideapad5', 'laptop'],
  ['vivobookpro', 'laptop oled screen'],
  ['inspiron15', 'laptop'],
  ['katana15', 'gaming laptop rgb'],
  ['tufF15', 'gaming laptop'],
  ['loq15', 'gaming laptop'],
  ['macbookairm2', 'macbook air'],
  ['spectrebiz', 'business laptop'],
  ['galaxym35', 'android smartphone'],
  ['redminote13', 'smartphone'],
  ['narzospeed', 'smartphone'],
  ['nord4', 'smartphone'],
  ['iphone14', 'iphone white background'],
  ['s23fe', 'samsung galaxy smartphone'],
  ['rockerz450', 'wireless headphones'],
  ['jbl770nc', 'over ear headphones'],
  ['sonywhch720', 'over ear headphones'],
  ['cloudstinger2', 'gaming headset'],
  ['k380', 'wireless keyboard'],
  ['shadowblade', 'mechanical keyboard rgb'],
  ['keychronk8', 'mechanical keyboard'],
  ['m221', 'wireless computer mouse'],
  ['hp220', 'computer mouse'],
  ['mxanywhere3s', 'wireless mouse'],
  ['a15gaming', 'gaming mouse rgb'],
  ['g102', 'gaming mouse'],
  ['samsung24fhd', 'computer monitor'],
  ['lg27qhd', 'computer monitor'],
  ['acernitro27', 'gaming monitor'],
  ['atbackpack', 'laptop backpack'],
  ['hprenew', 'backpack'],
  ['dellpremier', 'laptop backpack'],
  ['mybuddy', 'laptop stand'],
  ['boyastand', 'laptop stand aluminum'],
  ['zinqriser', 'laptop riser stand'],
];

// track how many times each query has been used so repeats get a different page
const queryCount = {};

async function fetchOne(query) {
  const page = (queryCount[query] = (queryCount[query] || 0) + 1);
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&page=${page}&orientation=landscape`;
  const res = await fetch(url, { headers: { Authorization: API_KEY } });
  if (!res.ok) throw new Error(`Pexels API error ${res.status} for "${query}"`);
  const data = await res.json();
  const photo = data.photos && data.photos[0];
  if (!photo) throw new Error(`No result for "${query}"`);
  // 'large' is a good size for a 500x400 product card
  return photo.src.large;
}

async function run() {
  const map = {};
  for (const [seed, query] of PRODUCTS) {
    try {
      map[seed] = await fetchOne(query);
      console.log(`✓ ${seed}  <-  "${query}"`);
    } catch (err) {
      console.error(`✗ ${seed}: ${err.message}`);
    }
    // be polite to the API
    await new Promise((r) => setTimeout(r, 250));
  }
  const outPath = path.join(__dirname, 'imageMap.json');
  fs.writeFileSync(outPath, JSON.stringify(map, null, 2));
  console.log(`\nSaved ${Object.keys(map).length}/${PRODUCTS.length} images to ${outPath}`);
  console.log('Now run: npm run seed');
}

run();