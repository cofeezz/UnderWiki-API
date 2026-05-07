const { Router } = require("express");
const { register, login, me } = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = Router();

// Públicas
router.post("/register", register);
router.post("/login", login);

// Protegida — retorna o usuário logado
router.get("/me", authMiddleware, me);

module.exports = router;
