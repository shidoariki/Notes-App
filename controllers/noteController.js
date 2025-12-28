const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * GET /api/notes
 * Get all notes for authenticated user with optional search and category filter
 */
exports.getNotes = async (req, res, next) => {
  try {
    const { search, category } = req.query;

    const where = { userId: req.userId };

    // Add search filter if provided
    if (search && String(search).trim() !== '') {
      const term = String(search);
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { content: { contains: term, mode: 'insensitive' } },
      ];
    }

    // Add category filter if provided
    if (category && String(category).trim() !== '') {
      where.category = { name: String(category) };
    }

    const notes = await prisma.note.findMany({
      where,
      include: { category: true },
      orderBy: { id: 'desc' },
    });

    // Map response format
    const mapped = notes.map((n) => ({
      id: n.id,
      title: n.title,
      content: n.content,
      createdAt: n.createdAt,
      category: n.category ? n.category.name : null,
    }));

    res.json(mapped);
  } catch (e) {
    console.error('Get notes error:', e);
    next(e);
  }
};

/**
 * POST /api/notes
 * Create new note for authenticated user
 */
exports.createNote = async (req, res, next) => {
  try {
    const { title, content, category } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }

    let categoryId = null;

    // Handle category assignment/creation
    if (category && category.trim() !== '') {
      const cat = await prisma.category.upsert({
        where: {
          name_userId: {
            name: category.trim(),
            userId: req.userId,
          },
        },
        update: {},
        create: { name: category.trim(), userId: req.userId },
      });
      categoryId = cat.id;
    }

    // Create note
    const note = await prisma.note.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        userId: req.userId,
        categoryId,
      },
      include: { category: true },
    });

    res.status(201).json({
      id: note.id,
      title: note.title,
      content: note.content,
      createdAt: note.createdAt,
      category: note.category ? note.category.name : null,
    });
  } catch (e) {
    console.error('Create note error:', e);
    next(e);
  }
};

/**
 * PUT /api/notes/:id
 * Update note for authenticated user (only owner can update)
 */
exports.updateNote = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { title, content, category } = req.body;

    // Validation
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    // Verify note belongs to user
    const note = await prisma.note.findUnique({ where: { id } });
    if (!note || note.userId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    let categoryId = undefined;

    // Handle category assignment/creation
    if (category !== undefined) {
      if (!category || !category.trim()) {
        categoryId = null;
      } else {
        const cat = await prisma.category.upsert({
          where: {
            name_userId: {
              name: category.trim(),
              userId: req.userId,
            },
          },
          update: {},
          create: { name: category.trim(), userId: req.userId },
        });
        categoryId = cat.id;
      }
    }

    // Update note
    const updated = await prisma.note.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : undefined,
        content: content !== undefined ? content.trim() : undefined,
        categoryId,
      },
      include: { category: true },
    });

    res.json({
      id: updated.id,
      title: updated.title,
      content: updated.content,
      createdAt: updated.createdAt,
      category: updated.category ? updated.category.name : null,
    });
  } catch (e) {
    console.error('Update note error:', e);
    next(e);
  }
};

/**
 * DELETE /api/notes/:id
 * Delete note for authenticated user (only owner can delete)
 */
exports.deleteNote = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    // Validation
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    // Verify note belongs to user
    const note = await prisma.note.findUnique({ where: { id } });
    if (!note || note.userId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Delete note
    const deleted = await prisma.note.delete({
      where: { id },
      include: { category: true },
    });

    res.json({
      message: 'Note deleted successfully',
      deleted: {
        id: deleted.id,
        title: deleted.title,
        content: deleted.content,
        createdAt: deleted.createdAt,
        category: deleted.category ? deleted.category.name : null,
      },
    });
  } catch (e) {
    console.error('Delete note error:', e);
    next(e);
  }
};
