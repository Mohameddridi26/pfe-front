const http = require('http');

const BASE_URL = 'http://localhost:3000';

function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Tests de l\'API Backend FITZONE\n');
  console.log('='.repeat(50));

  let token = null;

  try {
    // Test 1: Vérifier que le serveur fonctionne
    console.log('\n📌 Test 1: Vérification du serveur');
    try {
      const response = await makeRequest('GET', '/');
      if (response.status === 200) {
        console.log('✅ Serveur démarré correctement');
        console.log('   Message:', response.data.message);
      } else {
        console.log('❌ Erreur:', response.status);
      }
    } catch (error) {
      console.log('❌ Serveur non accessible:', error.message);
      console.log('💡 Assurez-vous que le serveur est démarré: npm run dev');
      process.exit(1);
    }

    // Test 2: Obtenir les tarifs (public)
    console.log('\n📌 Test 2: Obtenir les tarifs (endpoint public)');
    try {
      const response = await makeRequest('GET', '/api/tarifs');
      if (response.status === 200 && response.data.success) {
        console.log('✅ Tarifs récupérés avec succès');
        console.log(`   Nombre de tarifs: ${response.data.tarifs.length}`);
        response.data.tarifs.forEach(t => {
          console.log(`   - ${t.name}: ${t.price}€`);
        });
      } else {
        console.log('❌ Erreur:', response.data.message || response.status);
      }
    } catch (error) {
      console.log('❌ Erreur:', error.message);
    }

    // Test 3: Login
    console.log('\n📌 Test 3: Connexion (login)');
    try {
      const response = await makeRequest('POST', '/api/auth/login', {
        email: 'admin@fitzone.com',
        password: 'admin123'
      });
      if (response.status === 200 && response.data.success) {
        console.log('✅ Connexion réussie');
        token = response.data.token;
        console.log('   Utilisateur:', response.data.user.nom, response.data.user.prenom);
        console.log('   Rôle:', response.data.user.role);
        console.log('   Token reçu:', token.substring(0, 20) + '...');
      } else {
        console.log('❌ Erreur de connexion:', response.data.message || response.status);
        console.log('💡 Créez d\'abord un admin avec: node create-admin.js');
      }
    } catch (error) {
      console.log('❌ Erreur:', error.message);
    }

    // Test 4: Obtenir le profil (protégé)
    if (token) {
      console.log('\n📌 Test 4: Obtenir le profil utilisateur (endpoint protégé)');
      try {
        const response = await makeRequest('GET', '/api/auth/me', null, token);
        if (response.status === 200 && response.data.success) {
          console.log('✅ Profil récupéré avec succès');
          console.log('   Email:', response.data.user.email);
          console.log('   Nom:', response.data.user.nom, response.data.user.prenom);
        } else {
          console.log('❌ Erreur:', response.data.message || response.status);
        }
      } catch (error) {
        console.log('❌ Erreur:', error.message);
      }
    }

    // Test 5: Obtenir les utilisateurs (admin seulement)
    if (token) {
      console.log('\n📌 Test 5: Obtenir la liste des utilisateurs (admin)');
      try {
        const response = await makeRequest('GET', '/api/users', null, token);
        if (response.status === 200 && response.data.success) {
          console.log('✅ Utilisateurs récupérés avec succès');
          console.log(`   Nombre d'utilisateurs: ${response.data.users.length}`);
        } else {
          console.log('❌ Erreur:', response.data.message || response.status);
        }
      } catch (error) {
        console.log('❌ Erreur:', error.message);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('\n✅ Tests terminés !');
    console.log('\n💡 Pour tester manuellement:');
    console.log('   - Ouvrez http://localhost:3000 dans votre navigateur');
    console.log('   - Utilisez Postman pour tester les endpoints');

  } catch (error) {
    console.error('\n❌ Erreur générale:', error.message);
    process.exit(1);
  }
}

// Attendre un peu pour que le serveur soit prêt
setTimeout(() => {
  runTests().then(() => {
    process.exit(0);
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
}, 1000);
