
const jwt = require('jsonwebtoken');

function extrairToken(req) {
  if (req.cookies && req.cookies.token) return req.cookies.token;
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) return header.split(' ')[1];
  return null;
}

exports.autenticar = (req, res, next) => {
  const token = extrairToken(req);
  if (!token) return res.status(401).json({ error: 'Acesso não autorizado.' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload; // { id, empresa_id, role, username }
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
  }
};

exports.somenteAdminEmpresa = (req, res, next) => {
  if (!['admin_empresa', 'super_admin'].includes(req.usuario.role)) {
    return res.status(403).json({ error: 'Permissão insuficiente.' });
  }
  next();
};

exports.somenteSuperAdmin = (req, res, next) => {
  if (req.usuario.role !== 'super_admin') {
    return res.status(403).json({ error: 'Acesso restrito ao administrador do sistema.' });
  }
  next();
};
