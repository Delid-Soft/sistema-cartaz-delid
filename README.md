# Delid Gerador - Sistema Completo

## Como usar

1. Renomeie `backend/.env.example` para `backend/.env` e preencha com senhas reais.
2. Edite `nginx/conf.d/default.conf` trocando `seu-dominio.com.br` pelo seu domínio real.
3. Edite `frontend/index.html`, na constante `API_BASE_URL`, trocando pelo seu domínio real.
4. Envie esta pasta inteira para a VPS (via git clone ou scp).
5. Na VPS, dentro da pasta `delid-sistema`, rode:
   docker compose up -d --build
6. Configure o Certbot para SSL (ver instruções no chat).

Pronto! O sistema estará rodando com backend Node.js + PostgreSQL + Nginx.
