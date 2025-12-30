const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getCategories = async (req, res) => {
  try {
    const userId = req.user.userId;

    const categories = await prisma.category.findMany({
      where: { userId },
      include: {
        _count: { select: { notes: true } },
      },
      orderBy: { name: "asc" },
    });

    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Category name required" });
    }

    const category = await prisma.category.create({
      data: {
        name,
        userId,
      },
    });

    res.status(201).json(category);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Category already exists" });
    }
    console.error(error);
    res.status(500).json({ error: "Failed to create category" });
  }
};
