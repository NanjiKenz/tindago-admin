/**
 * Test script for Xendit integration
 * Run with: node test-xendit.js
 */

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

async function testInvoiceCreation() {
  log(colors.cyan, '\n=== Testing Invoice Creation ===');
  
  const testPayload = {
    orderNumber: `TEST-${Date.now()}`,
    total: 100.00,
    method: 'online',
    store: {
      id: 'test-store-123',
      name: 'Test Store',
      email: 'store@test.com'
    },
    customer: {
      email: 'customer@test.com',
      name: 'Test Customer',
      phone: '+639123456789'
    },
    items: [
      {
        name: 'Test Product',
        quantity: 1,
        price: 100.00
      }
    ]
  };

  try {
    log(colors.yellow, 'Sending request to create invoice...');
    const response = await fetch(`${BASE_URL}/api/payments/invoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });

    const data = await response.json();

    if (response.ok && data.success) {
      log(colors.green, '✓ Invoice created successfully!');
      console.log('Invoice ID:', data.invoiceId);
      console.log('Invoice URL:', data.invoiceUrl);
      console.log('Commission:', data.commission);
      console.log('Store Amount:', data.storeAmount);
      return data.invoiceId;
    } else {
      log(colors.red, '✗ Failed to create invoice');
      console.log('Error:', data.error || 'Unknown error');
      return null;
    }
  } catch (error) {
    log(colors.red, '✗ Network error');
    console.log('Error:', error.message);
    return null;
  }
}

async function testPaymentStatus(invoiceId) {
  if (!invoiceId) {
    log(colors.yellow, '\n=== Skipping Payment Status Test (no invoice ID) ===');
    return;
  }

  log(colors.cyan, '\n=== Testing Payment Status Check ===');
  
  try {
    log(colors.yellow, `Checking status for invoice: ${invoiceId}`);
    const response = await fetch(`${BASE_URL}/api/payments/status?invoiceId=${invoiceId}`);
    const data = await response.json();

    if (response.ok && data.success) {
      log(colors.green, '✓ Status retrieved successfully!');
      console.log('Status:', data.status);
      console.log('Is Paid:', data.isPaid);
      console.log('Amount:', data.amount);
      console.log('Currency:', data.currency);
    } else {
      log(colors.red, '✗ Failed to get status');
      console.log('Error:', data.error || 'Unknown error');
    }
  } catch (error) {
    log(colors.red, '✗ Network error');
    console.log('Error:', error.message);
  }
}

async function testServerHealth() {
  log(colors.cyan, '\n=== Testing Server Health ===');
  
  try {
    const response = await fetch(BASE_URL);
    if (response.ok) {
      log(colors.green, `✓ Server is running on ${BASE_URL}`);
      return true;
    } else {
      log(colors.red, `✗ Server returned status ${response.status}`);
      return false;
    }
  } catch (error) {
    log(colors.red, '✗ Cannot connect to server');
    console.log('Error:', error.message);
    console.log('\nMake sure the dev server is running:');
    console.log('  cd tindago-admin && npm run dev');
    return false;
  }
}

async function runTests() {
  log(colors.cyan, '\n╔════════════════════════════════════════╗');
  log(colors.cyan, '║  TindaGo Xendit Integration Tests     ║');
  log(colors.cyan, '╚════════════════════════════════════════╝');

  // Test 1: Server Health
  const serverUp = await testServerHealth();
  if (!serverUp) {
    log(colors.red, '\n✗ Tests aborted - server not running');
    process.exit(1);
  }

  // Test 2: Invoice Creation
  const invoiceId = await testInvoiceCreation();

  // Test 3: Payment Status (only if invoice was created)
  await testPaymentStatus(invoiceId);

  // Summary
  log(colors.cyan, '\n=== Test Summary ===');
  if (invoiceId) {
    log(colors.green, '✓ All tests passed!');
    log(colors.yellow, '\nNext steps:');
    console.log('1. Open the invoice URL in a browser to test payment');
    console.log('2. Configure webhook in Xendit dashboard');
    console.log('3. Test payment from mobile app');
  } else {
    log(colors.yellow, '⚠ Some tests failed - check errors above');
  }
  
  log(colors.cyan, '\n════════════════════════════════════════\n');
}

// Run tests
runTests().catch(error => {
  log(colors.red, '\n✗ Unexpected error:');
  console.error(error);
  process.exit(1);
});
