
CREATE TABLE IF NOT EXISTS empresas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    cnpj VARCHAR(20),
    telefone VARCHAR(20),
    endereco VARCHAR(255),
    plano VARCHAR(30) DEFAULT 'trial',
    ativo BOOLEAN DEFAULT TRUE,
    data_expiracao DATE,
    criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    username VARCHAR(60) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'usuario', -- 'usuario', 'admin_empresa', 'super_admin'
    ativo BOOLEAN DEFAULT TRUE,
    ultimo_login TIMESTAMP,
    criado_em TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_usuarios_empresa ON usuarios(empresa_id);

CREATE TABLE IF NOT EXISTS produtos (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    nome VARCHAR(150) NOT NULL,
    preco VARCHAR(20),
    unidade VARCHAR(20),
    foto_url VARCHAR(255),
    criado_em TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_produtos_empresa ON produtos(empresa_id);

CREATE TABLE IF NOT EXISTS campanhas (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    nome VARCHAR(150),
    tipo VARCHAR(20),
    modelo VARCHAR(40),
    validade VARCHAR(60),
    fundo_custom_url VARCHAR(255),
    logo_url VARCHAR(255),
    criado_em TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_campanhas_empresa ON campanhas(empresa_id);

CREATE TABLE IF NOT EXISTS campanha_itens (
    id SERIAL PRIMARY KEY,
    campanha_id INTEGER REFERENCES campanhas(id) ON DELETE CASCADE,
    produto_id INTEGER REFERENCES produtos(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS logs_acesso (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER,
    empresa_id INTEGER,
    acao VARCHAR(100),
    ip VARCHAR(60),
    criado_em TIMESTAMP DEFAULT NOW()
);

-- Super admin inicial (ajuste senha depois via script de seed)
-- INSERT INTO empresas (nome, plano) VALUES ('DELID TECNOLOGIA', 'admin');
