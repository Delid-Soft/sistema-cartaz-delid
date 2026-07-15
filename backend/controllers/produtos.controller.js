
const pool = require('../config/db');

exports.listar = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM produtos WHERE empresa_id = $1 ORDER BY criado_em DESC', [req.usuario.empresa_id]);
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.criar = async (req, res, next) => {
  try {
    const { nome, preco, unidade } = req.body;
    const foto_url = req.file ? `/uploads/${req.file.filename}` : null;
    const result = await pool.query(
      `INSERT INTO produtos (empresa_id, nome, preco, unidade, foto_url) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.usuario.empresa_id, nome.toUpperCase(), preco, (unidade||'UNID').toUpperCase(), foto_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.remover = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM produtos WHERE id = $1 AND empresa_id = $2', [id, req.usuario.empresa_id]);
    res.json({ message: 'Produto removido.' });
  } catch (err) { next(err); }
};
