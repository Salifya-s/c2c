import { readFile } from 'node:fs/promises';
import path from 'node:path';

const customersPath = path.join(process.cwd(), 'data', 'json', 'customers.json');
const merchantsPath = path.join(process.cwd(), 'data', 'json', 'merchants.json');

async function testJsonDatabase() {
  console.log('Testing JSON Database Records...');

  const customersRaw = await readFile(customersPath, 'utf8');
  const customers = JSON.parse(customersRaw);
  console.log(`✓ Customers JSON loaded. Total records: ${customers.length}`);

  const merchantsRaw = await readFile(merchantsPath, 'utf8');
  const merchants = JSON.parse(merchantsRaw);
  console.log(`✓ Merchants JSON loaded. Total records: ${merchants.length}`);

  if (customers.length < 5 || merchants.length < 5) {
    console.error('❌ Expected at least 5 mock records in both customer and merchant JSON files.');
    process.exit(1);
  }

  console.log('\n--- Initial Mock Customers ---');
  customers.slice(0, 5).forEach((c, idx) => console.log(`  [${idx + 1}] ${c.name} (${c.contact}) - ID: ${c.id}`));

  console.log('\n--- Initial Mock Merchants ---');
  merchants.slice(0, 5).forEach((m, idx) => console.log(`  [${idx + 1}] ${m.businessName} by ${m.name} (${m.contact}) - ID: ${m.id}`));

  console.log('\n✅ JSON Database validation succeeded!');
}

testJsonDatabase().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
