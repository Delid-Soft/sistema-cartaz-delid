
const { body, validationResult } = require('express-validator');

const tratarErros = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg, detalhes: errors.array() });
  }
  next();
};

exports.validarLogin = [
  body('username').trim().notEmpty().withMessage('Usuário é obrigatório').escape(),
  body('password').notEmpty().withMessage('Senha é obrigatória'),
  tratarErros
];

exports.validarRegistro = [
  body('empresa').trim().notEmpty().withMessage('Nome da empresa é obrigatório').escape(),
  body('username').trim().isLength({ min: 3 }).withMessage('Usuário deve ter no mínimo 3 caracteres').escape(),
  body('password').isLength({ min: 8 }).withMessage('Senha deve ter no mínimo 8 caracteres'),
  tratarErros
];

exports.validarProduto = [
  body('nome').trim().notEmpty().withMessage('Nome do produto é obrigatório').escape(),
  body('preco').trim().notEmpty().withMessage('Preço é obrigatório'),
  tratarErros
];
