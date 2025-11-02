#!/usr/bin/env node
/*
Set admin role for a user in RTDB: roles/{uid} = "admin"
Usage (PowerShell):
  $env:GOOGLE_APPLICATION_CREDENTIALS="C:\\path\\to\\serviceAccount.json"
  $env:FIREBASE_DATABASE_URL="https://<db>.firebasedatabase.app"
  npm run role:admin -- --uid=USER_UID
*/

const admin = require('firebase-admin');

function init() {
  if (admin.apps.length) return;
  const databaseURL = process.env.FIREBASE_DATABASE_URL;
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL,
  });
}

function getArg(name) {
  const arg = process.argv.find(a => a.startsWith(`--${name}=`));
  return arg ? arg.split('=')[1] : undefined;
}

(async function main() {
  init();
  const uid = getArg('uid');
  if (!uid) {
    console.error('Missing --uid=');
    process.exit(1);
  }
  const db = admin.database();
  await db.ref(`roles/${uid}`).set('admin');
  await db.ref(`admins/${uid}`).set(true);
  console.log(`Set roles/${uid} = \"admin\" and admins/${uid} = true`);
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
