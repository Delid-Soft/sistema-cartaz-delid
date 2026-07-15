const pool = require('../config/db');

async function criar(req, res) {
    const { empresa_id } = req.usuario;
    const {
        nome_promocao, validade, tipo_emissao, modelo,
        dimensao_folha, configuracoes, produtoIds
    } = req.body;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const fundoUrl = req.files?.fundo ? `/uploads/${req.files.fundo[0].filename}` : null;
        const logoUrl = req.files?.logo ? `/uploads/${req.files.logo[0].filename}` : null;

        const result = await client.query(
            `INSERT INTO campanhas
             (empresa_id, nome_promocao, validade, tipo_emissao, modelo, dimensao_folha, configuracoes, fundo_customizado_url, logo_encarte_url)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
            [empresa_id, nome_promocao, validade, tipo_emissao, modelo, dimensao_folha,
             JSON.stringify(configuracoes || {}), fundoUrl, logoUrl]
        );
        const campanhaId = result.rows[0].id;

        const ids = JSON.parse(produtoIds || '[]');
        for (let i = 0; i < ids.length; i++) {
            await client.query(
                'INSERT INTO campanha_itens (campanha_id, produto_id, ordem) VALUES ($1,$2,$3)',
                [campanhaId, ids[i], i]
            );
        }

        await client.query('COMMIT');
        res.status(201).json({ id: campanhaId });
    } catch (e) {
        await client.query('ROLLBACK');
        res.status(500).json({ erro: 'Erro ao criar campanha.' });
    } finally {
        client.release();
    }
}

async function obter(req, res) {
    const { empresa_id } = req.usuario;
    const { id } = req.params;

    const campanha = await pool.query(
        'SELECT * FROM campanhas WHERE id = $1 AND empresa_id = $2',
        [id, empresa_id]
    );
    if (!campanha.rows[0]) return res.status(404).json({ erro: 'Campanha não encontrada.' });

    const itens = await pool.query(
        `SELECT p.* FROM produtos p
         JOIN campanha_itens ci ON ci.produto_id = p.id
         WHERE ci.campanha_id = $1 ORDER BY ci.ordem`,
        [id]
    );

    res.json({ ...campanha.rows[0], itens: itens.rows });
}

async function listar(req, res) {
    const { empresa_id } = req.usuario;
    const result = await pool.query(
        'SELECT id, nome_promocao, tipo_emissao, criado_em FROM campanhas WHERE empresa_id = $1 ORDER BY criado_em DESC',
        [empresa_id]
    );
    res.json(result.rows);
}

module.exports = { criar, obter, listar };
