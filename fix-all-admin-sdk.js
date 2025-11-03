/**
 * Script to replace Firebase Admin SDK with Client SDK in all API routes
 * This fixes permission denied errors and slow response times
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
  'src/app/api/admin/auth/verify/route.ts'
];

console.log('🔄 Fixing Admin SDK usage in', files.length, 'files...\n');

let fixedCount = 0;
let errorCount = 0;

files.forEach((file, index) => {
  const filePath = path.join(__dirname, file);

  console.log(`${index + 1}/${files.length} Processing: ${file}`);

  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace import statement
    const oldImport = "import { getAdminDb } from '@/lib/adminFirebase';";
    const newImport = "import { database } from '@/lib/firebase';\nimport { ref, get, update, set, remove } from 'firebase/database';";

    if (content.includes(oldImport)) {
      content = content.replace(oldImport, newImport);
      console.log('  ✅ Replaced import statement');
    }

    // Replace getAdminDb() call
    content = content.replace(/const db = getAdminDb\(\);/g, 'const db = database;');

    // Replace Admin SDK ref().get() pattern with Client SDK
    // Pattern: db.ref('path').get() → get(ref(db, 'path'))
    content = content.replace(/db\.ref\('([^']+)'\)\.get\(\)/g, "get(ref(db, '$1'))");
    content = content.replace(/db\.ref\("([^"]+)"\)\.get\(\)/g, 'get(ref(db, "$1"))');
    content = content.replace(/db\.ref\(`([^`]+)`\)\.get\(\)/g, 'get(ref(db, `$1`))');

    // Replace Admin SDK update() pattern
    // Pattern: db.ref('path').update(data) → update(ref(db, 'path'), data)
    content = content.replace(/db\.ref\('([^']+)'\)\.update\(/g, "update(ref(db, '$1'), ");
    content = content.replace(/db\.ref\("([^"]+)"\)\.update\(/g, 'update(ref(db, "$1"), ');
    content = content.replace(/db\.ref\(`([^`]+)`\)\.update\(/g, 'update(ref(db, `$1`), ');

    // Replace Admin SDK set() pattern
    // Pattern: db.ref('path').set(data) → set(ref(db, 'path'), data)
    content = content.replace(/db\.ref\('([^']+)'\)\.set\(/g, "set(ref(db, '$1'), ");
    content = content.replace(/db\.ref\("([^"]+)"\)\.set\(/g, 'set(ref(db, "$1"), ');
    content = content.replace(/db\.ref\(`([^`]+)`\)\.set\(/g, 'set(ref(db, `$1`), ');

    // Replace Admin SDK remove() pattern
    // Pattern: db.ref('path').remove() → remove(ref(db, 'path'))
    content = content.replace(/db\.ref\('([^']+)'\)\.remove\(\)/g, "remove(ref(db, '$1'))");
    content = content.replace(/db\.ref\("([^"]+)"\)\.remove\(\)/g, 'remove(ref(db, "$1"))');
    content = content.replace(/db\.ref\(`([^`]+)`\)\.remove\(\)/g, 'remove(ref(db, `$1`))');

    // Write back to file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('  ✅ File updated successfully\n');
    fixedCount++;

  } catch (error) {
    console.error(`  ❌ Error: ${error.message}\n`);
    errorCount++;
  }
});

console.log('\n' + '='.repeat(50));
console.log('📊 Summary:');
console.log(`  ✅ Successfully fixed: ${fixedCount} files`);
console.log(`  ❌ Errors: ${errorCount} files`);
console.log('='.repeat(50));

if (fixedCount > 0) {
  console.log('\n✨ All Admin SDK references replaced with Client SDK!');
  console.log('\n📝 Next steps:');
  console.log('  1. Restart the admin dashboard: npm run dev');
  console.log('  2. Test login at http://localhost:3000/auth/login');
  console.log('  3. Verify dashboard loads fast (no freezing)');
  console.log('  4. Check all pages work correctly');
}

process.exit(errorCount > 0 ? 1 : 0);
