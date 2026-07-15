
const bcrypt = require('bcrypt');
const pool = require('../config/db');

// Dashboard com métricas gerais
exports.dashboard = async (req, res, next) => {
  try {
    const totalEmpresas = await pool.query('SELECT COUNT(*) FROM empresas');
    const totalAtivas = await pool.query("SELECT COUNT(*) FROM empresas WHERE ativo = true");
    const totalUsuarios = await pool.query('SELECT COUNT(*) FROM usuarios');
    const porPlano = await pool.query('SELECT plano, COUNT(*) as qtd FROM empresas GROUP BY plano');
    res.json({
      totalEmpresas: parseInt(totalEmpresas.rows[0].count),
      totalAtivas: parseInt(totalAtivas.rows[0].count),
      totalUsuarios: parseInt(totalUsuarios.rows[0].count),
      porPlano: porPlano.rows
    });
  } catch (err) { next(err); }
};

// Lista todas as empresas (clientes) da plataforma
exports.listarEmpresas = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT e.*, (SELECT COUNT(*) FROM usuarios u WHERE u.empresa_id = e.id) as total_usuarios
      FROM empresas e ORDER BY e.criado_em DESC
    `);
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.obterEmpresa = async (req, res, next) => {
  try {
    const { id } = req.params;
    const empresa = await pool.query('SELECT * FROM empresas WHERE id = $1', [id]);
    const usuarios = await pool.query('SELECT id, username, role, ativo, ultimo_login FROM usuarios WHERE empresa_id = $1', [id]);
    if (empresa.rows.length === 0) return res.status(404).json({ error: 'Empresa não encontrada.' });
    res.json({ ...empresa.rows[0], usuarios: usuarios.rows });
  } catch (err) { next(err); }
};

// Ativar / desativar empresa (bloquear acesso de clientes inadimplentes)
exports.alterarStatusEmpresa = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ativo } = req.body;
    await pool.query('UPDATE empresas SET ativo = $1 WHERE id = $2', [ativo, id]);
    res.json({ message: ativo ? 'Empresa ativada.' : 'Empresa bloqueada.' });
  } catch (err) { next(err); }
};

// Alterar plano e validade de assinatura
exports.alterarPlanoEmpresa = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { plano, data_expiracao } = req.body;
    await pool.query('UPDATE empresas SET plano = $1, data_expiracao = $2 WHERE id = $3', [plano, data_expiracao, id]);
    res.json({ message: 'Plano atualizado.' });
  } catch (err) { next(err); }
};

exports.removerEmpresa = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM empresas WHERE id = $1', [id]);
    res.json({ message: 'Empresa e todos os dados vinculados foram removidos.' });
  } catch (err) { next(err); }
};

// Criar novo super admin (uso interno)
exports.criarSuperAdmin = async (req, res, next) => {
  try {
    const { username, password, empresa_id } = req.body;
    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO usuarios (empresa_id, username, senha_hash, role) VALUES ($1,$2,$3,'super_admin') RETURNING id, username, role`,
      [empresa_id, username, hash]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

// Bloquear/desbloquear usuário específico de qualquer empresa
exports.alterarStatusUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ativo } = req.body;
    await pool.query('UPDATE usuarios SET ativo = $1 WHERE id = $2', [ativo, id]);
    res.json({ message: 'Status do usuário atualizado.' });
  } catch (err) { next(err); }
};

// Redefinir senha de qualquer usuário (uso do super admin)
exports.resetarSenhaUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { novaSenha } = req.body;
    if (!novaSenha || novaSenha.length < 8) {
      return res.status(400).json({ error: 'Senha deve ter no mínimo 8 caracteres.' });
    }
    const hash = await bcrypt.hash(novaSenha, 12);
    const result = await pool.query('UPDATE usuarios SET senha_hash = $1 WHERE id = $2 RETURNING id, username', [hash, id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json({ message: `Senha de ${result.rows[0].username} redefinida com sucesso.` });
  } catch (err) { next(err); }
};
