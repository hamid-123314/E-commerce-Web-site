import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { CartController } from "../../controllers/cart.controller.js";
import {
  cartItemSchema,
  updateCartItemSchema,
} from "../../validators/order.validator.js";

const router = Router();

// Middleware auth optionnel — attache req.user si token présent, sinon continue
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authenticate(req, res, next);
  }
  next();
};

router.get("/", optionalAuth, CartController.getCart);
router.post(
  "/items",
  optionalAuth,
  validate(cartItemSchema),
  CartController.addItem,
);
router.patch(
  "/items/:productId",
  optionalAuth,
  validate(updateCartItemSchema),
  CartController.updateItem,
);
router.delete("/items/:productId", optionalAuth, CartController.removeItem);
router.delete("/", optionalAuth, CartController.clearCart);

export default router;
