const prisma = require("../lib/prisma");

// Gera slug 
function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

async function listArtists(req, res) {
  try {
    const { search, genre, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { bio: { contains: search } },
      ];
    }
    if (genre) {
      where.genre = { contains: genre };
    }

    const [artists, total] = await Promise.all([
      prisma.artist.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { name: "asc" },
        select: { id: true, name: true, slug: true, genre: true, origin: true, formedYear: true, imageUrl: true },
      }),
      prisma.artist.count({ where }),
    ]);

    return res.json({
      data: artists,
      meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao listar artistas" });
  }
}

async function getArtist(req, res) {
  try {
    const { slug } = req.params;

    const artist = await prisma.artist.findUnique({
      where: { slug },
      include: {
        articles: {
          where: { published: true },
          orderBy: { createdAt: "desc" },
          select: { id: true, title: true, createdAt: true, author: { select: { username: true } } },
        },
      },
    });

    if (!artist) {
      return res.status(404).json({ error: "Artista não encontrado" });
    }

    return res.json(artist);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao buscar artista" });
  }
}

async function createArtist(req, res) {
  try {
    const { name, genre, origin, formedYear, bio, imageUrl } = req.body;

    if (!name) {
      return res.status(400).json({ error: "O campo 'name' é obrigatório" });
    }

    const slug = generateSlug(name);

    const existing = await prisma.artist.findUnique({ where: { slug } });
    if (existing) {
      return res.status(409).json({ error: "Já existe um artista com esse nome" });
    }

    if (formedYear && (formedYear < 1900 || formedYear > new Date().getFullYear())) {
      return res.status(400).json({ error: "Ano de formação inválido" });
    }

    const artist = await prisma.artist.create({
      data: { name, slug, genre, origin, formedYear: formedYear ? Number(formedYear) : null, bio, imageUrl },
    });

    return res.status(201).json(artist);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao criar artista" });
  }
}

async function updateArtist(req, res) {
  try {
    const { slug } = req.params;
    const { name, genre, origin, formedYear, bio, imageUrl } = req.body;

    const artist = await prisma.artist.findUnique({ where: { slug } });
    if (!artist) {
      return res.status(404).json({ error: "Artista não encontrado" });
    }

    const updateData = {};
    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = generateSlug(name);
    }
    if (genre !== undefined) updateData.genre = genre;
    if (origin !== undefined) updateData.origin = origin;
    if (formedYear !== undefined) updateData.formedYear = formedYear ? Number(formedYear) : null;
    if (bio !== undefined) updateData.bio = bio;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    const updated = await prisma.artist.update({ where: { slug }, data: updateData });

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao atualizar artista" });
  }
}

async function deleteArtist(req, res) {
  try {
    const { slug } = req.params;

    const artist = await prisma.artist.findUnique({ where: { slug } });
    if (!artist) {
      return res.status(404).json({ error: "Artista não encontrado" });
    }

    await prisma.artist.delete({ where: { slug } });

    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao deletar artista" });
  }
}

module.exports = { listArtists, getArtist, createArtist, updateArtist, deleteArtist };
