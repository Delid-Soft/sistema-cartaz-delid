const pool = require('../config/db');

async function listar(req, res) {
    const { empresa_id } = req.usuario;
    const result = await pool.query(
        'SELECT * FROM produtos WHERE empresa_id = $1 ORDER BY criado_em DESC',
        [empresa_id]
    );
    res.json(result.rows);
}

async function criar(req, res) {
    const { empresa_id, id: usuario_id } = req.usuario;
    const { nome, preco, unidade } = req.body;
    if (!nome || !preco) return res.status(400).json({ erro: 'Preencha nome e preço.' });

    const fotoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await pool.query(
        `INSERT INTO produtos (empresa_id, usuario_id, nome, preco, unidade, foto_url)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [empresa_id, usuario_id, nome.toUpperCase(), preco.replace(',', '.'), unidade || 'UNID', fotoUrl]
    );
    res.status(201).json(result.rows[0]);
}

async function remover(req, res) {
    const { empresa_id } = req.usuario;
    const { id } = req.params;
    await pool.query('DELETE FROM produtos WHERE id = $1 AND empresa_id = $2', [id, empresa_id]);
    res.status(204).send();
}

module.exports = { listar, criar, remover };
