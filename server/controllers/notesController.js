const Notes = require("../models/Notes");
const fs = require('fs').promises;
const path = require('path');

exports.createNotes = async (req, res) => {
    try {
        const { title, description, semester, type } = req.body;
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: "Please upload a PDF file"
            });
        }

        const notes = await Notes.create({
            title,
            description,
            semester,
            type,
            filePath: `uploads/${req.file.filename}`, 
            createdBy: req.user.id
        });

        return res.status(201).json({
            success: true,
            message: "Notes uploaded successfully",
            data: notes
        });
    } catch (e) {
        console.log("ERROR CREATING NOTES: ", e);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

exports.updateNotes = async (req, res) => {
    try {
        const { title, description, semester, type } = req.body;
        const notes = await Notes.findById(req.params.id);

        if (!notes) {
            return res.status(404).json({
                success: false,
                message: "Notes not found"
            });
        }

        notes.title = title;
        notes.description = description;
        notes.semester = semester;
        notes.type = type;

        if (req.file) {
            await fs.unlink(notes.filePath);
            notes.filePath = req.file.path;
        }

        await notes.save();

        return res.status(200).json({
            success: true,
            message: "Notes updated successfully",
            data: notes
        });
    } catch (e) {
        console.log("ERROR UPDATING NOTES: ", e);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

exports.deleteNotes = async (req, res) => {
    try {
        const notes = await Notes.findById(req.params.id);
        
        if (!notes) {
            return res.status(404).json({
                success: false,
                message: "Notes not found"
            });
        }

        await fs.unlink(notes.filePath);
        await Notes.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Notes deleted successfully"
        });
    } catch (e) {
        console.log("ERROR DELETING NOTES: ", e);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

exports.getAllNotes = async (req, res) => {
    try {
        const notes = await Notes.find().populate("createdBy", "username email");
        return res.status(200).json({
            success: true,
            data: notes
        });
    } catch (e) {
        console.log("ERROR GETTING NOTES: ", e);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

exports.getAdminNotes = async (req, res) => {
    try {
        const notes = await Notes.find({ createdBy: req.user.id });
        return res.status(200).json({
            success: true,
            data: notes
        });
    } catch (e) {
        console.log("ERROR GETTING ADMIN NOTES: ", e);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};


exports.downloadNotes = async (req, res) => {
    try {
        const notes = await Notes.findById(req.params.id);
        
        if (!notes) {
            return res.status(404).json({
                success: false,
                message: "Notes not found"
            });
        }

        const filePath = path.join(__dirname, '..', notes.filePath);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${notes.title.replace(/\s+/g, '_')}.pdf`);

        res.sendFile(filePath, (err) => {
            if (err) {
                console.log("Error downloading file:", err);
                return res.status(500).json({
                    success: false,
                    message: "Error downloading file"
                });
            }
        });
    } catch (e) {
        console.log("ERROR DOWNLOADING NOTES: ", e);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};