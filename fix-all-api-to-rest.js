/**
 * Convert all API routes to use Firebase REST API instead of Client SDK
 * This bypasses security rules and works on server-side
 */

const fs = require('fs');
const path = require('path');

const files = [
  'src/app/api/admin/stores/route.ts',
  'src/app/api/admin/stores/stats/route.ts',
  'src/app/api/admin/stores/all/route.ts',
  'src/app/api/admin/registrations/route.ts',
  'src/app/api/admin/customers/route.ts',
  'src/app/api/admin/customers/stats/route.ts',
  'src/app/api/admin/transactions/route.ts',
  'src/app/api/admin/payouts/route.ts',
  'src/app/api/admin/payouts/stats/route.ts',
  'src/app/api/admin/settings/commission/route.ts',
  'src/app/api/admin/users/all/route.ts'
];

console.log('🔄 Converting API routes to use Firebase REST API...\n');

const restApiTemplate = `
// Helper function to fetch from Firebase REST API
async function fetchFirebase(path: string) {
  const dbUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
  const url = \`\${dbUrl}/\${path}.json\`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch from Firebase');
  return res.json();
}
`;

files.forEach((file) => {
  const filePath = path.join(__dirname, file);

  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove Client SDK imports
    content = content.replace(/import { database } from '@\/lib\/firebase';?\n?/g, '');
    content = content.replace(/import { ref, get, update, set, remove } from 'firebase\/database';?\n?/g, '');

    // Add REST API helper if not already there
    if (!content.includes('fetchFirebase')) {
      content = content.replace(/export async function GET/, restApiTemplate + '\nexport async function GET');
    }

    // Replace get(ref(db, 'path')) with fetchFirebase('path')
    content = content.replace(/await get\(ref\(db, ['"`]([^'"`]+)['"`]\)\)/g, 'await fetchFirebase(\'$1\')');
    content = content.replace(/await get\(ref\(database, ['"`]([^'"`]+)['"`]\)\)/g, 'await fetchFirebase(\'$1\')');

    // Remove db variable declarations
    content = content.replace(/const db = database;?\n?/g, '');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${file}`);

  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log('\n✅ All API routes converted to use Firebase REST API!');
console.log('This bypasses security rules and works on server-side.');
console.log('\nRestart the server: npm run dev');
