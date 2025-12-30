const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getNotes = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { search, categoryId } = req.query;

    let where = { userId };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    if (categoryId && categoryId !== "") {
      where.categoryId = parseInt(categoryId);
    }

    const notes = await prisma.note.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(notes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
};

exports.createNote = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, content, categoryId } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content required" });
    }

    const note = await prisma.note.create({
      data: {
        title,
        content,
        userId,
        categoryId: categoryId ? parseInt(categoryId) : null,
      },
      include: { category: true },
    });

    res.status(201).json(note);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create note" });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { title, content, categoryId } = req.body;

    const note = await prisma.note.findUnique({ where: { id } });
    if (!note || note.userId !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const updated = await prisma.note.update({
      where: { id },
      data: {
        title: title || note.title,
        content: content || note.content,
        categoryId: categoryId ? parseInt(categoryId) : note.categoryId,
      },
      include: { category: true },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update note" });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const note = await prisma.note.findUnique({ where: { id } });
    if (!note || note.userId !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await prisma.note.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete note" });
  }
};
