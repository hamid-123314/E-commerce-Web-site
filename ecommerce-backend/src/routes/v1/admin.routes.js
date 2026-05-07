import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.js";
import { PaymentService } from "../../services/payment.service.js";
import { OrderService } from "../../services/order.service.js";
import { prisma } from "../../config/database.js";

const router = Router();

// Toutes les routes admin
router.use(authenticate, authorize("admin"));

// ── Dashboard stats ───────────────────────────────────────────────────────────
router.get("/stats", async (req, res, next) => {
  try {
    const [
      totalOrders,
      totalRevenue,
      totalUsers,
      totalProducts,
      recentOrders,
      ordersByStatus,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        where: { status: { in: ["paid", "shipped", "delivered"] } },
        _sum: { total: true },
      }),
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.order.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
    ]);

    res.json({
      status: "success",
      data: {
        totalOrders,
        totalRevenue: Number(totalRevenue._sum.total ?? 0).toFixed(2),
        totalUsers,
        totalProducts,
        recentOrders,
        ordersByStatus,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── Gestion de toutes les commandes ──────────────────────────────────────────
router.get("/orders", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page ?? "1");
    const limit = parseInt(req.query.limit ?? "20");
    const status = req.query.status;

    const where = status ? { status } : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: { include: { product: { select: { name: true } } } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      status: "success",
      data: { orders, total, page, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
});

// ── Remboursement ─────────────────────────────────────────────────────────────
router.post("/orders/:id/refund", async (req, res, next) => {
  try {
    const order = await PaymentService.refundOrder(req.params.id);
    res.json({ status: "success", data: { order } });
  } catch (err) {
    next(err);
  }
});

// ── Gestion des utilisateurs ──────────────────────────────────────────────────
router.get("/users", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page ?? "1");
    const limit = parseInt(req.query.limit ?? "20");

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
      }),
      prisma.user.count(),
    ]);

    res.json({ status: "success", data: { users, total } });
  } catch (err) {
    next(err);
  }
});

// ── Gestion du stock ──────────────────────────────────────────────────────────
router.get("/low-stock", async (req, res, next) => {
  try {
    const threshold = parseInt(req.query.threshold ?? "10");
    const products = await prisma.product.findMany({
      where: { stock: { lte: threshold } },
      orderBy: { stock: "asc" },
      include: { category: { select: { name: true } } },
    });
    res.json({ status: "success", data: { products } });
  } catch (err) {
    next(err);
  }
});

export default router;
