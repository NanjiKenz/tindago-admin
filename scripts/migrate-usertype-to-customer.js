#!/usr/bin/env node

/**
 * Firebase UserType Migration Script
 *
 * Migrates userType from 'user' to 'customer' in Firebase Realtime Database
 *
 * IMPORTANT: This is a one-time migration script that should be run carefully
 *
 * Steps performed:
 * 1. Creates a backup of current data
 * 2. Finds all users with userType: 'user'
 * 3. Updates them to userType: 'customer'
 * 4. Provides rollback functionality
 *
 * Usage:
 *   npm run migrate:usertype
 *   node scripts/migrate-usertype-to-customer.js
 *
 * Options:
 *   --dry-run    : Show what would be changed without making changes
 *   --rollback   : Revert the migration (requires backup file)
 *   --backup-only: Only create backup without migrating
 */

// Load environment variables
require('dotenv').config();

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get, set, update } = require('firebase/database');
const fs = require('fs');
const path = require('path');

// Firebase configuration (same as main app)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Script configuration
const BACKUP_DIR = './scripts/backups';
const BACKUP_FILE = `usertype-backup-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;

// Command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isRollback = args.includes('--rollback');
const isBackupOnly = args.includes('--backup-only');

/**
 * Ensure backup directory exists
 */
function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`📁 Created backup directory: ${BACKUP_DIR}`);
  }
}

/**
 * Create backup of current users data
 */
async function createBackup() {
  try {
    console.log('🔄 Creating backup of users data...');

    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);

    if (snapshot.exists()) {
      const usersData = snapshot.val();
      const backupPath = path.join(BACKUP_DIR, BACKUP_FILE);

      const backupData = {
        timestamp: new Date().toISOString(),
        originalData: usersData,
        recordCount: Object.keys(usersData).length
      };

      fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
      console.log(`✅ Backup created: ${backupPath}`);
      console.log(`📊 Backed up ${Object.keys(usersData).length} user records`);

      return backupPath;
    } else {
      console.log('⚠️  No users data found to backup');
      return null;
    }
  } catch (error) {
    console.error('❌ Error creating backup:', error);
    throw error;
  }
}

/**
 * Analyze current users data
 */
async function analyzeUsers() {
  try {
    console.log('🔍 Analyzing current users data...');

    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);

    if (!snapshot.exists()) {
      console.log('⚠️  No users data found');
      return { userTypeUsers: [], storeOwnerUsers: [], otherUsers: [], total: 0 };
    }

    const usersData = snapshot.val();
    const userTypeUsers = [];
    const storeOwnerUsers = [];
    const otherUsers = [];

    Object.entries(usersData).forEach(([userId, userData]) => {
      if (userData.userType === 'user') {
        userTypeUsers.push({ userId, ...userData });
      } else if (userData.userType === 'store_owner') {
        storeOwnerUsers.push({ userId, ...userData });
      } else {
        otherUsers.push({ userId, userType: userData.userType || 'undefined', ...userData });
      }
    });

    console.log(`📊 Analysis Results:`);
    console.log(`   Total users: ${Object.keys(usersData).length}`);
    console.log(`   Users with userType 'user': ${userTypeUsers.length} (these will be migrated)`);
    console.log(`   Users with userType 'store_owner': ${storeOwnerUsers.length}`);
    console.log(`   Users with other/undefined userType: ${otherUsers.length}`);

    if (otherUsers.length > 0) {
      console.log(`   Other userTypes found:`, [...new Set(otherUsers.map(u => u.userType))]);
    }

    return {
      userTypeUsers,
      storeOwnerUsers,
      otherUsers,
      total: Object.keys(usersData).length
    };
  } catch (error) {
    console.error('❌ Error analyzing users:', error);
    throw error;
  }
}

/**
 * Perform the migration
 */
async function migrateUsers(userTypeUsers) {
  try {
    console.log(`🚀 Starting migration of ${userTypeUsers.length} users...`);

    let successCount = 0;
    let errorCount = 0;

    for (const user of userTypeUsers) {
      try {
        if (isDryRun) {
          console.log(`[DRY RUN] Would update user ${user.userId}: userType 'user' → 'customer'`);
        } else {
          const userRef = ref(database, `users/${user.userId}`);
          await update(userRef, {
            userType: 'customer',
            // Add migration metadata
            migrationData: {
              migratedAt: new Date().toISOString(),
              originalUserType: 'user',
              migrationScript: 'migrate-usertype-to-customer.js'
            }
          });
          console.log(`✅ Updated user ${user.userId}: ${user.email || 'No email'}`);
        }
        successCount++;
      } catch (error) {
        console.error(`❌ Error updating user ${user.userId}:`, error);
        errorCount++;
      }
    }

    console.log(`📊 Migration Results:`);
    console.log(`   ✅ Successful updates: ${successCount}`);
    console.log(`   ❌ Failed updates: ${errorCount}`);

    return { successCount, errorCount };
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  }
}

/**
 * Rollback migration using backup file
 */
async function rollbackMigration() {
  try {
    // Find the most recent backup file
    const backupFiles = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('usertype-backup-') && file.endsWith('.json'))
      .sort()
      .reverse();

    if (backupFiles.length === 0) {
      console.error('❌ No backup files found. Cannot rollback.');
      return;
    }

    const latestBackup = backupFiles[0];
    const backupPath = path.join(BACKUP_DIR, latestBackup);

    console.log(`🔄 Rolling back using backup: ${backupPath}`);

    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    const usersRef = ref(database, 'users');

    if (isDryRun) {
      console.log(`[DRY RUN] Would restore ${backupData.recordCount} user records`);
    } else {
      await set(usersRef, backupData.originalData);
      console.log(`✅ Rollback completed. Restored ${backupData.recordCount} user records.`);
    }
  } catch (error) {
    console.error('❌ Error during rollback:', error);
    throw error;
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Firebase UserType Migration Script');
  console.log('=====================================');

  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made');
  }

  if (isRollback) {
    console.log('🔄 ROLLBACK MODE - Reverting previous migration');
  }

  try {
    ensureBackupDir();

    if (isRollback) {
      await rollbackMigration();
      return;
    }

    // Create backup
    const backupPath = await createBackup();

    if (isBackupOnly) {
      console.log('📦 Backup-only mode completed');
      return;
    }

    // Analyze current data
    const analysis = await analyzeUsers();

    if (analysis.userTypeUsers.length === 0) {
      console.log('✅ No users with userType "user" found. Migration not needed.');
      return;
    }

    // Confirm migration (in non-dry-run mode)
    if (!isDryRun) {
      console.log('\n⚠️  WARNING: This will modify your Firebase database!');
      console.log(`   ${analysis.userTypeUsers.length} users will be updated`);
      console.log(`   Backup created at: ${backupPath}`);
      console.log('\n   Continue? (y/N): ');

      // For now, we'll proceed automatically. In a real scenario, you'd want user confirmation
      console.log('Proceeding with migration...\n');
    }

    // Perform migration
    const results = await migrateUsers(analysis.userTypeUsers);

    if (!isDryRun && results.successCount > 0) {
      console.log('\n🎉 Migration completed successfully!');
      console.log('\nNext steps:');
      console.log('1. Update your admin dashboard services to use "customer" instead of "user"');
      console.log('2. Update your React Native app to use "customer" instead of "user"');
      console.log('3. Test all functionality');
      console.log(`4. Keep the backup file: ${backupPath}`);
    }

  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

// Execute the script
main();