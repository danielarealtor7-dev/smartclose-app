const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zpwqxjqaxvcbkuszdclj.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function generateData() {
  console.log('Generating 500 synthetic transactions for performance testing...');

  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({ name: 'Perf Test Org' })
    .select()
    .single();

  if (orgError) {
    console.error('Error creating org:', orgError);
    return;
  }
  
  console.log('Created Org:', org.id);

  const transactions = [];
  const statuses = ['PENDING', 'ACTIVE', 'CLOSING_SOON', 'CLOSED', 'CANCELLED'];
  const sides = ['BUYER', 'SELLER', 'DUAL'];
  
  for (let i = 1; i <= 500; i++) {
    const d = new Date();
    d.setDate(d.getDate() + (Math.floor(Math.random() * 100) - 50));
    
    transactions.push({
      org_id: org.id,
      status: statuses[i % 5],
      buyer_names: `Synthetic Buyer ${i}`,
      seller_names: `Synthetic Seller ${i}`,
      property_address: `${1000 + i} Synthetic Ave, Test City, NY`,
      transaction_side: sides[i % 3],
      effective_date: d.toISOString().split('T')[0],
      financing_type: 'Conventional',
      property_type: 'Single Family'
    });
  }

  for (let i = 0; i < 500; i += 100) {
    const batch = transactions.slice(i, i + 100);
    const { error: txError } = await supabase
      .from('transactions')
      .insert(batch);
      
    if (txError) {
      console.error('Error inserting transactions:', txError);
      return;
    }
    console.log(`Inserted ${i + 100} / 500 transactions`);
  }

  console.log('Done! To test performance with these 500 transactions, you must view the app logged into a user associated with this org_id.');
}

generateData();
