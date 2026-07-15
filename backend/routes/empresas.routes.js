
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/empresas.controller');
const { autenticar } = require('../middleware/auth');

router.use(autenticar);
router.get('/minha', ctrl.obterMinhaEmpresa);
router.put('/minha', ctrl.atualizarMinhaEmpresa);
router.get('/filiais', ctrl.listarFiliaisUsuarios);
router.post('/filiais', ctrl.criarFilialUsuario);
router.delete('/filiais/:id', ctrl.removerFilialUsuario);

module.exports = router;
