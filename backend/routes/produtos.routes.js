
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/produtos.controller');
const { autenticar } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { validarProduto } = require('../middleware/validate');

router.use(autenticar);
router.get('/', ctrl.listar);
router.post('/', upload.single('foto'), validarProduto, ctrl.criar);
router.delete('/:id', ctrl.remover);

module.exports = router;
