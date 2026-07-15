
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/auth.controller');
const { autenticar } = require('../middleware/auth');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/logout', ctrl.logout);
router.get('/me', autenticar, ctrl.me);
router.put('/minha-senha', autenticar, ctrl.alterarMinhaSenha);

module.exports = router;
