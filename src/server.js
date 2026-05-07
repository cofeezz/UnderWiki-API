require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const artistRoutes = require("./routes/artist.routes");
const articleRoutes = require("./routes/article.routes");
const userRoutes = require("./routes/user.routes");

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

// Rotas
app.use("/api/auth", authRoutes);
app.use("/api/artists", artistRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/users", userRoutes);

// Rota health check
app.get("/", (req, res) => {
  res.json({ message: "Underground Wiki API rodando" });
});

// Handler erro
app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

// Handler erro global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Erro interno do servidor" });
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}... HELL YEAA`);
});
