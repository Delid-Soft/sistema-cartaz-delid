
const pool = require('../config/db');

exports.listar = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM campanhas WHERE empresa_id = $1 ORDER BY criado_em DESC', [req.usuario.empresa_id]);
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.criar = async (req, res, next) => {
  try {
    const { nome, tipo, modelo, validade, produtos } = req.body;
    const fundo_custom_url = req.files && req.files.fundo ? `/uploads/${req.files.fundo[0].filename}` : null;
    const logo_url = req.files && req.files.logo ? `/uploads/${req.files.logo[0].filename}` : null;

    const result = await pool.query(
      `INSERT INTO campanhas (empresa_id, nome, tipo, modelo, validade, fundo_custom_url, logo_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.usuario.empresa_id, nome, tipo, modelo, validade, fundo_custom_url, logo_url]
    );
    const campanha = result.rows[0];

    if (produtos) {
      const ids = JSON.parse(produtos);
      for (const produtoId of ids) {
        await pool.query('INSERT INTO campanha_itens (campanha_id, produto_id) VALUES ($1,$2)', [campanha.id, produtoId]);
      }
    }
    res.status(201).json(campanha);
  } catch (err) { next(err); }
};

exports.remover = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM campanhas WHERE id = $1 AND empresa_id = $2', [id, req.usuario.empresa_id]);
    res.json({ message: 'Campanha removida.' });
  } catch (err) { next(err); }
};
