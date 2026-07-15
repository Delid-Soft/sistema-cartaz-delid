const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

async function cadastrar(req, res) {
    const { nomeEmpresa, usuario, senha } = req.body;
    if (!nomeEmpresa || !usuario || !senha) {
        return res.status(400).json({ erro: 'Preencha todos os campos.' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const empresaResult = await client.query(
            'INSERT INTO empresas (nome) VALUES ($1) RETURNING id',
            [nomeEmpresa]
        );
        const empresaId = empresaResult.rows[0].id;

        const senhaHash = await bcrypt.hash(senha, 10);
        await client.query(
            `INSERT INTO usuarios (empresa_id, nome_exibicao, login, senha_hash, papel)
             VALUES ($1, $2, $3, $4, 'admin')`,
            [empresaId, nomeEmpresa, usuario, senhaHash]
        );

        await client.query('COMMIT');
        res.status(201).json({ mensagem: 'Cadastro realizado com sucesso!' });
    } catch (e) {
        await client.query('ROLLBACK');
        if (e.code === '23505') return res.status(409).json({ erro: 'Usuário já existe.' });
        res.status(500).json({ erro: 'Erro ao cadastrar.' });
    } finally {
        client.release();
    }
}

async function login(req, res) {
    const { usuario, senha } = req.body;
    const result = await pool.query(
        `SELECT u.*, e.nome AS nome_empresa FROM usuarios u
         JOIN empresas e ON e.id = u.empresa_id
         WHERE u.login = $1 AND u.ativo = TRUE`,
        [usuario]
    );

    const conta = result.rows[0];
    if (!conta) return res.status(401).json({ erro: 'Usuário ou senha incorretos.' });

    const senhaOk = await bcrypt.compare(senha, conta.senha_hash);
    if (!senhaOk) return res.status(401).json({ erro: 'Usuário ou senha incorretos.' });

    const token = jwt.sign(
        { id: conta.id, empresa_id: conta.empresa_id, papel: conta.papel },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
    );

    res.json({
        token,
        empresa: conta.nome_empresa,
        usuario: conta.login
    });
}

module.exports = { cadastrar, login };
