const { Router } = require("express");
const { listArticles, getArticle, createArticle, updateArticle, deleteArticle } = require("../controllers/article.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = Router();

// Públicas
router.get("/", listArticles);
router.get("/:id", getArticle);

// Protegidas
router.post("/", authMiddleware, createArticle);
router.put("/:id", authMiddleware, updateArticle);
router.delete("/:id", authMiddleware, deleteArticle);

module.exports = router;
