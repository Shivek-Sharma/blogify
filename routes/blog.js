const Router = require('express');
const multer = require('multer');
const path = require('path');

const Blog = require('../models/blog');
const Comment = require('../models/comment');

const router = Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve(`./public/uploads`));
    },
    filename: function (req, file, cb) {
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null, fileName);
    }
});

const upload = multer({ storage: storage })

router.get("/add-new", (req, res) => {
    return res.render("addBlog", { user: req.user });
});

router.get("/:id", async (req, res) => {
    // https://mongoosejs.com/docs/api/query.html#Query.prototype.populate()
    const blog = await Blog.findById(req.params.id).populate("createdBy");
    // console.log("Blog: ", blog)
    const comments = await Comment.find({ blogID: req.params.id }).populate("createdBy");

    return res.render("blog", { user: req.user, blog, comments });
});

router.post("/", upload.single("coverImage"), async (req, res) => {
    const { title, body } = req.body;

    const blog = await Blog.create({
        title,
        body,
        createdBy: req.user._id,
        coverImageURL: `/uploads/${req.file.filename}`
    });

    return res.redirect(`/blog/${blog._id}`);
});

router.post("/comment/:blogID", async (req, res) => {
    await Comment.create({
        content: req.body.content,
        blogID: req.params.blogID,
        createdBy: req.user._id
    });

    return res.redirect(`/blog/${req.params.blogID}`);
});

module.exports = router; 