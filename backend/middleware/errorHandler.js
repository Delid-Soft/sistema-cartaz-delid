
module.exports = (err, req, res, next) => {
  console.error(err.stack || err);
  if (err.message && err.message.includes('Tipo de arquivo')) {
    return res.status(400).json({ error: err.message });
  }
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
  return res.status(500).json({ error: err.message, stack: err.stack });
};
