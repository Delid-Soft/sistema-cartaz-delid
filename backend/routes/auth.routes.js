
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/auth.controller');
const { autenticar } = require('../middleware/auth');
const { validarLogin, validarRegistro } = require('../middleware/validate');

router.post('/register', validarRegistro, ctrl.register);
router.post('/login', validarLogin, ctrl.login);
router.post('/logout', ctrl.logout);
router.get('/me', autenticar, ctrl.me);

module.exports = router;
