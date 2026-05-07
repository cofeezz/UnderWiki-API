const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");

async function getProfile(req, res) {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        createdAt: true,
        _count: { select: { articles: true } },
        articles: {
          where: { published: true },
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            title: true,
            createdAt: true,
            artist: { select: { name: true, slug: true } },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao buscar perfil" });
  }
}

async function updateProfile(req, res) {
  try {
    const { username, email, currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.userId } });

    const updateData = {};

    if (username !== undefined) {
      if (username.trim().length < 3) {
        return res.status(400).json({ error: "Username deve ter pelo menos 3 caracteres" });
      }
      const taken = await prisma.user.findFirst({ where: { username, NOT: { id: req.userId } } });
      if (taken) return res.status(409).json({ error: "Username já está em uso" });
      updateData.username = username.trim();
    }

    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) return res.status(400).json({ error: "E-mail inválido" });
      const taken = await prisma.user.findFirst({ where: { email, NOT: { id: req.userId } } });
      if (taken) return res.status(409).json({ error: "E-mail já está em uso" });
      updateData.email = email;
    }

    if (newPassword !== undefined) {
      if (!currentPassword) {
        return res.status(400).json({ error: "A senha atual é necessária para alterar a senha" });
      }
      const passwordMatch = await bcrypt.compare(currentPassword, user.password);
      if (!passwordMatch) return res.status(401).json({ error: "Senha atual incorreta" });
      if (newPassword.length < 6) return res.status(400).json({ error: "A nova senha deve ter pelo menos 6 caracteres" });
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const updated = await prisma.user.update({
      where: { id: req.userId },
      data: updateData,
      select: { id: true, username: true, email: true, updatedAt: true },
    });

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao atualizar perfil" });
  }
}

async function deleteAccount(req, res) {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: "Confirme sua senha para deletar a conta" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Senha incorreta" });
    }

    await prisma.user.delete({ where: { id: req.userId } });

    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao deletar conta" });
  }
}

module.exports = { getProfile, updateProfile, deleteAccount };
