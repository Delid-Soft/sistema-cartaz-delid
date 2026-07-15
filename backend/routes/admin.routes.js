
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/admin.controller');
const { autenticar, somenteSuperAdmin } = require('../middleware/auth');

router.use(autenticar, somenteSuperAdmin);

router.get('/dashboard', ctrl.dashboard);
router.get('/empresas', ctrl.listarEmpresas);
router.get('/empresas/:id', ctrl.obterEmpresa);
router.put('/empresas/:id/status', ctrl.alterarStatusEmpresa);
router.put('/empresas/:id/plano', ctrl.alterarPlanoEmpresa);
router.delete('/empresas/:id', ctrl.removerEmpresa);
router.put('/usuarios/:id/status', ctrl.alterarStatusUsuario);
router.post('/super-admin', ctrl.criarSuperAdmin);

module.exports = router;
