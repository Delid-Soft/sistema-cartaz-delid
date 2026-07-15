
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => {
    const nomeSeguro = crypto.randomBytes(16).toString('hex') + path.extname(file.originalname).toLowerCase();
    cb(null, nomeSeguro);
  }
});

function filtroArquivo(req, file, cb) {
  if (!TIPOS_PERMITIDOS.includes(file.mimetype)) {
    return cb(new Error('Tipo de arquivo não permitido. Envie apenas imagens (jpg, png, webp).'));
  }
  cb(null, true);
}

module.exports = multer({
  storage,
  fileFilter: filtroArquivo,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});
