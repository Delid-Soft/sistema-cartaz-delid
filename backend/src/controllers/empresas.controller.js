const pool = require('../config/db');
const bcrypt = require('bcrypt');

async function obterDados(req, res) {
    const { empresa_id } = req.usuario;
    const result = await pool.query('SELECT * FROM empresas WHERE id = $1', [empresa_id]);
    if (!result.rows[0]) return res.status(404).json({ erro: 'Empresa não encontrada.' });
    res.json(result.rows[0]);
}

async function atualizarDados(req, res) {
    const { empresa_id, papel } = req.usuario;
    if (papel !== 'admin') return res.status(403).json({ erro: 'Apenas o administrador pode editar estes dados.' });

    const { cnpj, telefone, endereco } = req.body;
    const result = await pool.query(
        `UPDATE empresas SET cnpj = $1, telefone = $2, endereco = $3 WHERE id = $4 RETURNING *`,
        [cnpj, telefone, endereco, empresa_id]
    );
    res.json(result.rows[0]);
}

async function listarFiliais(req, res) {
    const { empresa_id } = req.usuario;
    const result = await pool.query(
        'SELECT id, nome_exibicao, login, papel, ativo FROM usuarios WHERE empresa_id = $1 ORDER BY criado_em',
        [empresa_id]
    );
    res.json(result.rows);
}

async function criarFilial(req, res) {
    const { empresa_id, papel } = req.usuario;
    if (papel !== 'admin') return res.status(403).json({ erro: 'Apenas o administrador pode criar acessos.' });

    const { nomeFilial, usuario, senha } = req.body;
    if (!nomeFilial || !usuario || !senha) return res.status(400).json({ erro: 'Preencha todos os campos.' });

    try {
        const senhaHash = await bcrypt.hash(senha, 10);
        const result = await pool.query(
            `INSERT INTO usuarios (empresa_id, nome_exibicao, login, senha_hash, papel)
             VALUES ($1, $2, $3, $4, 'filial') RETURNING id, nome_exibicao, login, papel`,
            [empresa_id, nomeFilial, usuario, senhaHash]
        );
        res.status(201).json(result.rows[0]);
    } catch (e) {
        if (e.code === '23505') return res.status(409).json({ erro: 'Este usuário já existe.' });
        res.status(500).json({ erro: 'Erro ao criar filial.' });
    }
}

async function desativarFilial(req, res) {
    const { empresa_id, papel } = req.usuario;
    if (papel !== 'admin') return res.status(403).json({ erro: 'Apenas o administrador pode remover acessos.' });

    const { id } = req.params;
    await pool.query(
        'UPDATE usuarios SET ativo = FALSE WHERE id = $1 AND empresa_id = $2 AND papel != $3',
        [id, empresa_id, 'admin']
    );
    res.status(204).send();
}

module.exports = { obterDados, atualizarDados, listarFiliais, criarFilial, desativarFilial };
