#!/bin/bash
# Backup automático do Postgres + uploads
# Adicione ao crontab: 0 3 * * * /caminho/para/backup.sh

set -e
DATA=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$HOME/backups_delid"
mkdir -p "$BACKUP_DIR"

# Backup do banco
docker compose exec -T postgres pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_DIR/db_$DATA.sql"

# Backup das imagens enviadas
docker run --rm -v delid_uploads_data:/data -v "$BACKUP_DIR":/backup alpine \
  tar czf "/backup/uploads_$DATA.tar.gz" -C /data .

# Mantém apenas os últimos 7 backups
find "$BACKUP_DIR" -name "db_*.sql" -mtime +7 -delete
find "$BACKUP_DIR" -name "uploads_*.tar.gz" -mtime +7 -delete

echo "Backup concluído: $DATA"
