import { Router } from "express";
import partController from "../controllers/partController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.post("/", roleMiddleware(["CREATOR"]), partController.createPart);
router.post(
  "/:partId",
  roleMiddleware(["CREATOR"]),
  partController.addToInventory,
);
router.get(
  "/",
  roleMiddleware(["CREATOR", "VIEWER"]),
  partController.getAllParts,
);

export default router;
