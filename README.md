# Delid Sistema Gerador de Cartazes — SaaS v2.0

## O que mudou nesta versão
- Segurança: helmet, rate-limit, validação de entrada, senhas com bcrypt, JWT em cookie httpOnly (não mais no localStorage/JS).
- Multi-tenant real via `empresa_id` em todas as tabelas.
- Área de **Admin/SaaS** (`/admin`): dashboard, gestão de planos, bloqueio/exclusão de empresas.
- Frontend: modais agora têm botão de fechar (X, clique fora, ESC), toasts de erro/sucesso, layout modernizado (cores, cards, sombras).
- Upload de imagens validado por tipo/mimetype e limitado a 5MB.

## Estrutura
```
backend/        -> API Node/Express + Postgres
frontend/       -> index.html (app) e admin.html (painel SaaS)
nginx/          -> proxy reverso e servidor estático
scripts/        -> backup.sh (backup automático do banco + uploads)
docker-compose.yml
.env.example
```

## Como subir (na VPS, dentro da pasta do projeto)
```bash
cp .env.example .env
nano .env   # ajuste DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, FRONTEND_URL

docker compose up -d --build
```

## Criar o primeiro Super Admin (acesso ao /admin)
```bash
docker compose exec backend node scripts/seedSuperAdmin.js
```
Isso cria um usuário `superadmin` (ou o valor de `SEED_ADMIN_USER` no `.env`) com role `super_admin`.
Acesse depois em: `https://seudominio.com/admin`

## Backup automático
```bash
chmod +x scripts/backup.sh
crontab -e
# adicione: 0 3 * * * /caminho/completo/scripts/backup.sh
```

## Próximos passos sugeridos
1. Configurar HTTPS com Certbot (Nginx já expõe `/.well-known/acme-challenge/`).
2. Testar login normal em `/` e login admin em `/admin`.
3. Trocar a senha do super admin após o primeiro login.
