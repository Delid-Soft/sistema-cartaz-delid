
CREATE TABLE empresas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    cnpj VARCHAR(20),
    telefone VARCHAR(20),
    endereco VARCHAR(255),
    logo_url VARCHAR(255),
    criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nome_exibicao VARCHAR(150) NOT NULL,
    login VARCHAR(50) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    papel VARCHAR(20) DEFAULT 'filial',
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE produtos (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    nome VARCHAR(150) NOT NULL,
    preco NUMERIC(10,2) NOT NULL,
    unidade VARCHAR(20) DEFAULT 'UNID',
    foto_url VARCHAR(255),
    criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE campanhas (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nome_promocao VARCHAR(150),
    validade VARCHAR(100),
    tipo_emissao VARCHAR(20),
    modelo VARCHAR(50),
    dimensao_folha VARCHAR(5),
    configuracoes JSONB,
    fundo_customizado_url VARCHAR(255),
    logo_encarte_url VARCHAR(255),
    criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE campanha_itens (
    campanha_id INTEGER REFERENCES campanhas(id) ON DELETE CASCADE,
    produto_id INTEGER REFERENCES produtos(id) ON DELETE CASCADE,
    ordem INTEGER DEFAULT 0,
    PRIMARY KEY (campanha_id, produto_id)
);

CREATE INDEX idx_usuarios_empresa ON usuarios(empresa_id);
CREATE INDEX idx_produtos_empresa ON produtos(empresa_id);
CREATE INDEX idx_campanhas_empresa ON campanhas(empresa_id);
