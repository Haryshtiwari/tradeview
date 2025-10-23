const { executeQuery, executeTransaction, initializeDatabase } = require('./backend/config/database');

async function addBalance() {
  try {
    // Initialize database connection
    await initializeDatabase();
    console.log('Adding $10,000 balance to test user...');
    
    // Get the trading account for user ID 2
    const accounts = await executeQuery(
      'SELECT id, account_number, balance FROM trading_accounts WHERE user_id = ?',
      [2]
    );
    
    if (accounts.length === 0) {
      console.log('No trading account found for user ID 2');
      return;
    }
    
    const account = accounts[0];
    console.log(`Found account: ${account.account_number}, current balance: $${account.balance}`);
    
    const newBalance = 10000.00;
    const previousBalance = parseFloat(account.balance);
    const changeAmount = newBalance - previousBalance;
    
    // Start transaction
    await executeTransaction(async (connection) => {
      // Update account balance
      await connection.execute(
        'UPDATE trading_accounts SET balance = ?, equity = ?, free_margin = ?, updated_at = NOW() WHERE id = ?',
        [newBalance, newBalance, newBalance, account.id]
      );
      
      // Add balance history record
      await connection.execute(
        `INSERT INTO account_balance_history 
        (account_id, previous_balance, new_balance, change_amount, change_type, change_context, performed_by_type, notes) 
        VALUES (?, ?, ?, ?, 'manual_credit', 'adjustment', 'admin', 'Added initial balance for testing')`,
        [account.id, previousBalance, newBalance, changeAmount]
      );
      
      console.log(`✅ Successfully updated balance:`);
      console.log(`   Previous: $${previousBalance}`);
      console.log(`   New: $${newBalance}`);
      console.log(`   Change: +$${changeAmount}`);
    });
    
  } catch (error) {
    console.error('Error adding balance:', error);
  } finally {
    process.exit(0);
  }
}

addBalance();