const { Router } = require("express");
const { getProfile, updateProfile, deleteAccount } = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = Router();

// Pública — perfil público de qualquer usuário
router.get("/:username", getProfile);

// Protegidas — somente o próprio usuário
router.put("/me/profile", authMiddleware, updateProfile);
router.delete("/me/account", authMiddleware, deleteAccount);

module.exports = router;
