const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/Auth");
const upload = require("../middleware/multer"); 
const {
    createNotes,
    updateNotes,
    deleteNotes,
    getAllNotes,
    getAdminNotes,
    downloadNotes
} = require("../controllers/notesController");

router.post("/create", authMiddleware, upload.single('pdf'), createNotes);
router.put("/update/:id", authMiddleware, upload.single('pdf'), updateNotes);
router.delete("/delete/:id", authMiddleware, deleteNotes);
router.get("/all", authMiddleware, getAllNotes);
router.get("/admin", authMiddleware, getAdminNotes);
router.get("/download/:id", authMiddleware, downloadNotes);

module.exports = router;