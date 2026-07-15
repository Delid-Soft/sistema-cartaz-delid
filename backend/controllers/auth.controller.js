
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 60 * 60 * 1000 // 1h
};

function gerarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, empresa_id: usuario.empresa_id, role: usuario.role, username: usuario.username },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}

exports.register = async (req, res, next) => {
  try {
    const { empresa, username, password } = req.body;
    const existe = await pool.query('SELECT id FROM usuarios WHERE username = $1', [username]);
    if (existe.rows.length > 0) return res.status(409).json({ error: 'Usuário já existe.' });

    const empresaResult = await pool.query(
      `INSERT INTO empresas (nome, plano, ativo, data_expiracao) VALUES ($1, 'trial', true, NOW() + INTERVAL '15 days') RETURNING id`,
      [empresa]
    );
    const empresaId = empresaResult.rows[0].id;

    const hash = await bcrypt.hash(password, 12);
    const usuarioResult = await pool.query(
      `INSERT INTO usuarios (empresa_id, username, senha_hash, role) VALUES ($1, $2, $3, 'admin_empresa') RETURNING id, empresa_id, username, role`,
      [empresaId, username, hash]
    );

    const usuario = usuarioResult.rows[0];
    const token = gerarToken(usuario);
    res.cookie('token', token, COOKIE_OPTS);
    res.status(201).json({ message: 'Cadastro realizado com sucesso.', usuario: { id: usuario.id, username: usuario.username, empresa, role: usuario.role } });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const result = await pool.query(
      `SELECT u.*, e.nome AS empresa_nome, e.ativo AS empresa_ativa, e.data_expiracao
       FROM usuarios u JOIN empresas e ON e.id = u.empresa_id
       WHERE u.username = $1`,
      [username]
    );
    if (result.rows.length === 0) return res.status(401).json({ error: 'Usuário ou senha incorretos.' });

    const usuario = result.rows[0];
    if (!usuario.ativo) return res.status(403).json({ error: 'Seu acesso foi desativado. Contate o suporte.' });
    if (!usuario.empresa_ativa) return res.status(403).json({ error: 'Empresa inativa ou plano expirado.' });

    const senhaOk = await bcrypt.compare(password, usuario.senha_hash);
    if (!senhaOk) return res.status(401).json({ error: 'Usuário ou senha incorretos.' });

    await pool.query('UPDATE usuarios SET ultimo_login = NOW() WHERE id = $1', [usuario.id]);

    const token = gerarToken(usuario);
    res.cookie('token', token, COOKIE_OPTS);
    res.json({
      message: 'Login efetuado.',
      usuario: { id: usuario.id, username: usuario.username, empresa: usuario.empresa_nome, role: usuario.role, empresa_id: usuario.empresa_id }
    });
  } catch (err) { next(err); }
};

exports.logout = (req, res) => {
  res.clearCookie('token', COOKIE_OPTS);
  res.json({ message: 'Logout realizado.' });
};

exports.me = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.role, e.nome AS empresa, e.id as empresa_id, e.cnpj, e.telefone, e.endereco
       FROM usuarios u JOIN empresas e ON e.id = u.empresa_id WHERE u.id = $1`, [req.usuario.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};
