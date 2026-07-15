
require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../config/db');

(async () => {
  const username = process.env.SEED_ADMIN_USER || 'superadmin';
  const password = process.env.SEED_ADMIN_PASS || 'MudeEstaSenha123!';

  try {
    const empresa = await pool.query(
      `INSERT INTO empresas (nome, plano, ativo) VALUES ('DELID TECNOLOGIA', 'admin', true) RETURNING id`
    );
    const empresaId = empresa.rows[0].id;
    const hash = await bcrypt.hash(password, 12);
    await pool.query(
      `INSERT INTO usuarios (empresa_id, username, senha_hash, role) VALUES ($1,$2,$3,'super_admin')`,
      [empresaId, username, hash]
    );
    console.log(`Super admin criado: ${username} / ${password}`);
    console.log('IMPORTANTE: troque essa senha após o primeiro login.');
  } catch (err) {
    console.error('Erro ao criar super admin:', err.message);
  } finally {
    process.exit();
  }
})();
