#!/usr/bin/env node
/*
Reconcile Wallets nightly from ledgers + payouts (Admin repo)
Usage (PowerShell):
  $env:GOOGLE_APPLICATION_CREDENTIALS="C:\\path\\to\\serviceAccount.json"
  $env:FIREBASE_DATABASE_URL="https://<db>.firebasedatabase.app"
  npm run cron:reconcile
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

function num(n) { const x = Number(n); return isNaN(x) ? 0 : x; }

async function main() {
  init();
  const db = admin.database();
  const [ledgersSnap, payoutsSnap] = await Promise.all([
    db.ref('ledgers/stores').get(),
    db.ref('payouts').get(),
  ]);
  const ledgersStores = ledgersSnap.exists() ? ledgersSnap.val() : {};
  const payouts = payoutsSnap.exists() ? payoutsSnap.val() : {};

  // group payouts by storeId
  const byStore = {};
  for (const [, p] of Object.entries(payouts)) {
    const sid = p && p.storeId; if (!sid) continue;
    (byStore[sid] ||= []).push(p);
  }

  const storeIds = new Set([...Object.keys(ledgersStores||{}), ...Object.keys(byStore||{})]);
  let i = 0;
  for (const storeId of storeIds) {
    const txns = ((ledgersStores[storeId] || {}).transactions) || {};
    let earned = 0; let pendingTxn = 0;
    for (const [, t] of Object.entries(txns)) {
      const s = String(t && t.status || '').toUpperCase();
      const amt = num(t && (t.storeAmount ?? t.amount));
      if (s === 'PENDING') pendingTxn += amt; else if (s === 'PAID' || s === 'SETTLED') earned += amt;
    }
    let totalWithdrawn = 0; let pendingWithdrawal = 0;
    for (const p of (byStore[storeId] || [])) {
      const s = String(p && p.status || '').toLowerCase();
      const amt = num(p && p.amount);
      if (s === 'completed') totalWithdrawn += amt; else if (s === 'pending' || s === 'approved') pendingWithdrawal += amt;
    }
    const available = Math.max(earned - totalWithdrawn - pendingWithdrawal, 0);
    await db.ref(`wallets/${storeId}`).update({ available, pendingWithdrawal, totalWithdrawn, updatedAt: Date.now() });
    i++; console.log(`${i}/${storeIds.size} reconciled ${storeId}: avail=${available}`);
  }
  console.log('Reconcile complete.');
  process.exit(0);
}

main().catch((e)=>{ console.error(e); process.exit(1); });
