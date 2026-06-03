const Tag = require('../models/tagModel');
const Question = require('../models/questionModel');

// GET ALL TAGS FUNCTION
const getAllTags = async (req, res) => {
    try {
        // GET ALL TAGS IN ALPHABETICAL ORDER
        const tags = await Tag.find()
            .sort({ tag_name : 1 });

        res.status(200).json({
            success : true,
            count : tags.length,
            data : tags
        });
    } catch (err) {
        res.status(500).json({ 
            success : false,
            message: err.message 
        });
    }
};

// GET TAG BY ID FUNCTION
const getTagById = async (req, res) => {
    try {
        // FIND A SPECIFIC TAG USING ITS ID
        const tag = await Tag.findById(req.params.id);

        // CHECK IF TAG IS FOUND OR NOT
        if (!tag) {
            return res.status(404).json({ 
                success : false,
                message: 'Tag not found' 
            });
        }

        res.status(200).json({
            success : true,
            data : tag
        });
    } catch (err) {
        res.status(500).json({ 
            success : false,
            message: err.message 
        });
    }
};

// CREATE TAG FUNCTION - ONLY FOR ADMIN
const createTag = async (req, res) => {
    try {
        // GET TAG NAME AND VALIDATE IT IS NOT EMPTY
        const { tag_name } = req.body;
        if(!tag_name || !tag_name.trim()) {
            return res.status(400).json({
                success : false,
                message : 'Tag name is Empty'
            });
        }

        // CHECK WHETHER TAG ALREADY EXISTS OR NOT
        const existingTag = await Tag.findOne({ tag_name : tag_name.trim().toLowerCase() });
        if(existingTag) {
            return res.status(400).json({
                success : false,
                message : 'Tag already exists'
            });
        }

        // CREATE NEW TAG
        const newTag = await Tag.create({ tag_name : tag_name.trim().toLowerCase() });
        res.status(201).json({
            success : true,
            message : 'Tag created successfully',
            data : newTag
        });
    } catch (err) {
        res.status(500).json({ 
            success : false,
            message: err.message 
        });
    }
};

// UPDATE TAG FUNCTION - ONLY FOR ADMIN
const updateTag = async (req, res) => {
    try {
        const { id } = req.params;
        const { tag_name } = req.body;

        // FIRST FIND THE TAG USING ID
        const tag = await Tag.findById(tag_id);
        if(!tag) {
            return res.status(404).json({
                success : false,
                message : 'Tag not found'
            });
        }

        // UPDATE TAG NAME AND CHECK IF UPDATED VERSION ALREADY EXSISTS OR NOT
        if(tag_name && tag_name.trim()) {
            const newName = tag_name.trim().toLowerCase();

            const existingTag = await Tag.findOne({
                tag_name : newName,
                _id : { $ne : id }
            });

            if(existingTag) {
                return res.status(400).json({
                    success : false,
                    message : 'Another tag with this name exists'
                });
            }
            tag.tag_name = newName;
        }

        // SAVE THE UPDATES IN DATABASE
        await tag.save();

        res.status(200).json({
            success : true,
            message : 'Tag updated successfully',
            data : tag
        });
    } catch (err) {
        res.status(500).json({
            success : false,
            message : err.message
        });
    }
};

// DELETE TAG FUNCTION
const deleteTag = async (req, res) => {
    try {
        const { id } = req.params;

        // FIRST FIND THE TAG BY ID AND CHECK WHETHER IT IS EMPTY OR NOT 
        const tag = await Tag.findById(id);
        if(!tag) {
            return res.status(404).json({
                success : false,
                message : 'Tag not found'
            });
        }

        // CHECK HOW MANY QUESTIONS ARE USING THAT TAG
        const questionUsingTag = await Question.countDocuments({ tag_id : id });
        if(questionUsingTag > 0) {
            return res.status(400).json({
                success : false,
                message : `Cannot delete Tag. It is used by ${questionUsingTag} questions`,
                questionCount : questionUsingTag
            });
        }

        // DELETE THE TAG FROM DATABASE
        await Tag.findByIdAndDelete(id);

        res.status(200).json({ 
            success : true,
            message: 'Tag deleted successfully' 
        });
    } catch (err) {
        res.status(500).json({ 
            success : false,
            message: err.message 
        });
    }
};

module.exports = {
    getAllTags,
    getTagById,
    createTag,
    updateTag,
    deleteTag
};