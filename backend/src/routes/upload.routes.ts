import { Router } from "express";
import { upload } from "../middleware/upload.middleware";
import {
  uploadSingleImage,
  uploadMultiImages,
} from "../controllers/upload.controller";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";

const router = Router();

// ====================================================================================================== //
//                                          ROUTES UPLOAD IMMAGINI
// ====================================================================================================== //
// UPLOAD SINGOLA IMMAGINE
// POST /upload/single
router.post(
  "/single",
  authenticateToken,
  requireRole("ADMIN"),
  upload.single("image"),
  uploadSingleImage
);

// UPLOAD MULTI IMAMGINI
// POST /upload/multiple
router.post(
  "/multiple",
  authenticateToken,
  requireRole("ADMIN"),
  upload.array("images", 10),
  uploadMultiImages
);
// ====================================================================================================== //
// ====================================================================================================== //
export default router;
