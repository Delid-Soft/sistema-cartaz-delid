const express = require('express');
const router = express.Router();
const { autenticar } = require('../middleware/auth');
const {
    obterDados, atualizarDados,
    listarFiliais, criarFilial, desativarFilial
} = require('../controllers/empresas.controller');

router.use(autenticar);
router.get('/', obterDados);
router.put('/', atualizarDados);
router.get('/filiais', listarFiliais);
router.post('/filiais', criarFilial);
router.delete('/filiais/:id', desativarFilial);

module.exports = router;
