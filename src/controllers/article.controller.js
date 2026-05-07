const prisma = require("../lib/prisma");

async function listArticles(req, res) {
  try {
    const { artistId, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = { published: true };
    if (artistId) where.artistId = Number(artistId);

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { id: true, username: true } },
          artist: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.article.count({ where }),
    ]);

    return res.json({
      data: articles,
      meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao listar artigos" });
  }
}

async function getArticle(req, res) {
  try {
    const { id } = req.params;

    const article = await prisma.article.findUnique({
      where: { id: Number(id) },
      include: {
        author: { select: { id: true, username: true } },
        artist: { select: { id: true, name: true, slug: true } },
        edits: {
          include: { editor: { select: { username: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!article || !article.published) {
      return res.status(404).json({ error: "Artigo não encontrado" });
    }

    return res.json(article);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao buscar artigo" });
  }
}

async function createArticle(req, res) {
  try {
    const { title, content, artistId } = req.body;

    if (!title || !content || !artistId) {
      return res.status(400).json({ error: "title, content e artistId são obrigatórios" });
    }

    if (title.trim().length < 3) {
      return res.status(400).json({ error: "O título deve ter pelo menos 3 caracteres" });
    }

    if (content.trim().length < 10) {
      return res.status(400).json({ error: "O conteúdo deve ter pelo menos 10 caracteres" });
    }

    const artist = await prisma.artist.findUnique({ where: { id: Number(artistId) } });
    if (!artist) {
      return res.status(404).json({ error: "Artista não encontrado" });
    }

    const article = await prisma.article.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        artistId: Number(artistId),
        authorId: req.userId,
      },
      include: {
        author: { select: { id: true, username: true } },
        artist: { select: { id: true, name: true, slug: true } },
      },
    });

    return res.status(201).json(article);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao criar artigo" });
  }
}

async function updateArticle(req, res) {
  try {
    const { id } = req.params;
    const { title, content, summary } = req.body;

    const article = await prisma.article.findUnique({ where: { id: Number(id) } });

    if (!article || !article.published) {
      return res.status(404).json({ error: "Artigo não encontrado" });
    }

    // Somente o autor pode editar o próprio artigo (talvez mudar futuramente)
    if (article.authorId !== req.userId) {
      return res.status(403).json({ error: "Você não tem permissão para editar este artigo" });
    }

    const updateData = {};
    if (title !== undefined) {
      if (title.trim().length < 3) return res.status(400).json({ error: "Título muito curto" });
      updateData.title = title.trim();
    }
    if (content !== undefined) {
      if (content.trim().length < 10) return res.status(400).json({ error: "Conteúdo muito curto" });
      updateData.content = content.trim();
    }

    const updated = await prisma.article.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        author: { select: { id: true, username: true } },
        artist: { select: { id: true, name: true, slug: true } },
      },
    });

    // Registrar a edição no histórico
    if (Object.keys(updateData).length > 0) {
      await prisma.edit.create({
        data: {
          articleId: Number(id),
          editorId: req.userId,
          summary: summary || null,
        },
      });
    }

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao atualizar artigo" });
  }
}

async function deleteArticle(req, res) {
  try {
    const { id } = req.params;

    const article = await prisma.article.findUnique({ where: { id: Number(id) } });

    if (!article || !article.published) {
      return res.status(404).json({ error: "Artigo não encontrado" });
    }

    if (article.authorId !== req.userId) {
      return res.status(403).json({ error: "Você não tem permissão para deletar este artigo" });
    }

    // Soft delete — mantém o histórico
    await prisma.article.update({
      where: { id: Number(id) },
      data: { published: false },
    });

    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao deletar artigo" });
  }
}

module.exports = { listArticles, getArticle, createArticle, updateArticle, deleteArticle };
