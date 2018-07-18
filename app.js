var express     = require("express"),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    methodOverride = require("method-override"),
    expressSanitizer = require("express-sanitizer");

var app = express();

var dbUrl = process.env.DATABASEURL || "mongodb://localhost/blog_app";
mongoose.connect(dbUrl);
// APP CONFIG //
app.set("view engine", "ejs");
app.use(express.static("public")); //serving public direcotory
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

// MONGOOSE/MODEL CONFIG //
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

// RESTFUL ROUTES //
app.get("/", function(req, res) {
    res.redirect("/blogs");
});

// INDEX //
app.get("/blogs", function(req, res) {
    Blog.find({}, function(err, blogs) {
        if(err) {
            console.log("Error!" + err);
        } else {
            res.render("index", {blogs: blogs});
        }
    });
});

// NEW //

app.get("/blogs/new", function(req, res) {
    res.render("new");
});

// CREATE //

app.post("/blogs", function(req, res) {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog) {
        if(err) {
            console.log("ERROR! " + err);
        } else {
            res.redirect("/blogs");
        };
    });
});

// SHOW //

app.get("/blogs/:id", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog) {
        if(err) {
            console.log("Error " + err);
            res.redirect("/blogs");
        } else {
        res.render("show", {blog: foundBlog});
        }
    });
});

// EDIT //

app.get("/blogs/:id/edit", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog) {
        if (err) {
            console.log("Error: " + err);
            res.redirect("/blogs");
        } else {
            res.render("edit", {blog: foundBlog});
        }
    });
});

// UPDATE //

app.put("/blogs/:id", function(req, res) {
    req.body.blog.body = req.sanitize(req.body.blog.body); //sanitizing html textarea
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog) {
        if (err) {
            console.log("Error: " + err)
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

// DElETE //

app.delete("/blogs/:id", function(req, res) {
    Blog.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            console.log("Error: " + err)
            res.redirect("/blogs")
        } else {
            res.redirect("/blogs");
        };
    });
});

app.listen(process.env.PORT || 3000, function() {
    console.log("Server started.");
});