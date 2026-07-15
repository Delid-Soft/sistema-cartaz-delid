const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ erro: 'Token não fornecido' });

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = payload;
        next();
    } catch (e) {
        return res.status(401).json({ erro: 'Token inválido ou expirado' });
    }
}

module.exports = { autenticar };
