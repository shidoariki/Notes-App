const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * GET /api/categories
 * Get all categories for authenticated user
 */
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: { userId: req.userId },
      orderBy: { id: 'asc' },
    });
    res.json(categories);
  } catch (e) {
    console.error('Get categories error:', e);
    next(e);
  }
};

/**
 * POST /api/categories
 * Create new category for authenticated user
 */
exports.createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    // Check if category already exists for this user
    const existing = await prisma.category.findFirst({
      where: { name: name.trim(), userId: req.userId },
    });
    if (existing) {
      return res.status(400).json({ error: 'Category already exists' });
    }

    // Create category
    const cat = await prisma.category.create({
      data: { name: name.trim(), userId: req.userId },
    });

    res.status(201).json(cat);
  } catch (e) {
    console.error('Create category error:', e);
    next(e);
  }
};
