const pool = require('./config/database');
const bcrypt = require('bcrypt');

async function createAdmin() {
  try {
    const email = 'admin@fitzone.com';
    const password = 'admin123';
    
    console.log('🔐 Création d\'un utilisateur admin de test...\n');
    
    // Générer le hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Vérifier si l'utilisateur existe déjà
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existing.length > 0) {
      console.log('⚠️  L\'utilisateur admin existe déjà !');
      console.log('   Email:', email);
      console.log('   Mot de passe:', password);
      console.log('   ID:', existing[0].id);
      process.exit(0);
    }
    
    // Créer l'admin
    const adminId = `admin-${Date.now()}`;
    await pool.execute(
      `INSERT INTO users (id, nom, prenom, email, password, role) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [adminId, 'Admin', 'Test', email, hashedPassword, 'admin']
    );
    
    console.log('✅ Admin créé avec succès !');
    console.log('   Email:', email);
    console.log('   Mot de passe:', password);
    console.log('   ID:', adminId);
    console.log('\n💡 Vous pouvez maintenant vous connecter avec ces identifiants');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('\n💡 Vérifiez que:');
    console.error('   1. XAMPP MySQL est démarré');
    console.error('   2. La base de données "fitzone_db" existe');
    console.error('   3. La table "users" existe');
    process.exit(1);
  }
}

createAdmin();
