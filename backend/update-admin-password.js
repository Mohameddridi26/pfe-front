const pool = require('./config/database');
const bcrypt = require('bcrypt');

async function updateAdminPassword() {
  try {
    const email = 'admin@fitzone.com';
    const password = 'admin123';
    
    console.log('🔐 Mise à jour du mot de passe admin...\n');
    
    // Générer le hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Vérifier si l'utilisateur existe
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existing.length === 0) {
      console.log('❌ Utilisateur admin non trouvé !');
      console.log('💡 Créez d\'abord un admin avec: node create-admin.js');
      process.exit(1);
    }
    
    // Mettre à jour le mot de passe
    await pool.execute(
      `UPDATE users SET password = ? WHERE email = ?`,
      [hashedPassword, email]
    );
    
    console.log('✅ Mot de passe admin mis à jour avec succès !');
    console.log('   Email:', email);
    console.log('   Nouveau mot de passe:', password);
    console.log('   ID:', existing[0].id);
    console.log('\n💡 Vous pouvez maintenant vous connecter avec ces identifiants');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

updateAdminPassword();
