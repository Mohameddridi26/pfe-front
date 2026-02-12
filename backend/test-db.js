const pool = require('./config/database');

async function testConnection() {
  try {
    console.log('🔍 Test de connexion à la base de données...\n');
    
    // Test 1: Compter les utilisateurs
    const [users] = await pool.execute('SELECT COUNT(*) as count FROM users');
    console.log('✅ Connexion réussie !');
    console.log(`   📊 Nombre d'utilisateurs: ${users[0].count}`);
    
    // Test 2: Vérifier les tarifs
    const [tarifs] = await pool.execute('SELECT COUNT(*) as count FROM tarifs');
    console.log(`   💰 Nombre de tarifs: ${tarifs[0].count}`);
    
    // Test 3: Lister les tarifs
    const [tarifsList] = await pool.execute('SELECT id, name, price FROM tarifs LIMIT 5');
    if (tarifsList.length > 0) {
      console.log('\n   📋 Tarifs disponibles:');
      tarifsList.forEach(t => {
        console.log(`      - ${t.name}: ${t.price}€`);
      });
    }
    
    // Test 4: Vérifier les tables
    const [tables] = await pool.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'fitzone_db'
    `);
    console.log(`\n   📑 Tables dans la base: ${tables.length}`);
    tables.forEach(t => {
      console.log(`      - ${t.TABLE_NAME}`);
    });
    
    console.log('\n✅ Tous les tests sont passés !');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur de connexion:', error.message);
    console.error('\n💡 Vérifiez que:');
    console.error('   1. XAMPP MySQL est démarré');
    console.error('   2. La base de données "fitzone_db" existe');
    console.error('   3. Les tables sont créées (importez schema.sql)');
    process.exit(1);
  }
}

testConnection();
