
const bcrypt = require('bcrypt');
const pool = require('../config/db');

exports.obterMinhaEmpresa = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT id, nome, cnpj, telefone, endereco, plano, data_expiracao FROM empresas WHERE id = $1', [req.usuario.empresa_id]);
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.atualizarMinhaEmpresa = async (req, res, next) => {
  try {
    const { cnpj, telefone, endereco } = req.body;
    await pool.query('UPDATE empresas SET cnpj=$1, telefone=$2, endereco=$3 WHERE id=$4',
      [cnpj, telefone, endereco, req.usuario.empresa_id]);
    res.json({ message: 'Dados atualizados.' });
  } catch (err) { next(err); }
};

exports.listarFiliaisUsuarios = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT id, username, role, ativo, ultimo_login FROM usuarios WHERE empresa_id = $1 ORDER BY id', [req.usuario.empresa_id]);
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.criarFilialUsuario = async (req, res, next) => {
  try {
    if (!['admin_empresa', 'super_admin'].includes(req.usuario.role)) {
      return res.status(403).json({ error: 'Somente administradores podem criar acessos.' });
    }
    const { username, password } = req.body;
    if (!username || !password || password.length < 8) {
      return res.status(400).json({ error: 'Usuário e senha (mín. 8 caracteres) são obrigatórios.' });
    }
    const existe = await pool.query('SELECT id FROM usuarios WHERE username = $1', [username]);
    if (existe.rows.length > 0) return res.status(409).json({ error: 'Usuário já existe.' });

    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO usuarios (empresa_id, username, senha_hash, role) VALUES ($1,$2,$3,'usuario') RETURNING id, username, role`,
      [req.usuario.empresa_id, username, hash]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.removerFilialUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!['admin_empresa', 'super_admin'].includes(req.usuario.role)) {
      return res.status(403).json({ error: 'Sem permissão.' });
    }
    await pool.query('DELETE FROM usuarios WHERE id = $1 AND empresa_id = $2 AND role != $3', [id, req.usuario.empresa_id, 'admin_empresa']);
    res.json({ message: 'Acesso removido.' });
  } catch (err) { next(err); }
};
