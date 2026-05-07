const { Router } = require("express");
const { listArtists, getArtist, createArtist, updateArtist, deleteArtist } = require("../controllers/artist.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = Router();

// Públicas — qualquer pessoa pode ler
router.get("/", listArtists);
router.get("/:slug", getArtist);

// Protegidas — requer autenticação
router.post("/", authMiddleware, createArtist);
router.put("/:slug", authMiddleware, updateArtist);
router.delete("/:slug", authMiddleware, deleteArtist);

module.exports = router;
