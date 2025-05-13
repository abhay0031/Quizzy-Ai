const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    semester: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Notes', notesSchema);