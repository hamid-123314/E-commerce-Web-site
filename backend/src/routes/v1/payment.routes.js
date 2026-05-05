import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { PaymentService } from "../../services/payment.service.js";

const router = Router();

// Créer une session Stripe Checkout pour une commande existante
router.post("/checkout/:orderId", authenticate, async (req, res, next) => {
  try {
    const result = await PaymentService.createCheckoutSession(
      req.user.id,
      req.params.orderId,
    );
    res.json({ status: "success", data: result });
  } catch (err) {
    next(err);
  }
});

// Webhook Stripe — PAS de authenticate, Stripe envoie sa propre signature
// Le raw body est configuré dans app.js avant express.json()
router.post("/webhook", async (req, res, next) => {
  try {
    const signature = req.headers["stripe-signature"];
    const result = await PaymentService.handleWebhook(req.body, signature);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
