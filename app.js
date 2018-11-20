//========SETUP & REQUIRE=========================================
var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    Campground  = require("./models/campground"),
    Comment     = require("./models/comment"),
    seedDB      = require("./seeds");
    

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/yelp_camp", {useMongoClient: true});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
seedDB();



//========ROUTES=========================================

app.get("/", function(req, res){
    res.render("landing");
});
//------Index Route- show all campgrounds
app.get("/campgrounds", function(req, res){
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        } else {
        res.render("campgrounds/index", {campgrounds: allCampgrounds});
        }
    });
    
});
//------Create Route- add campground to DB
app.post("/campgrounds", function(req, res){
   //get data from form and add to campgrounds array
   var name = req.body.name;
   var image = req.body.image;
   var desc = req.body.description;
   var newCampground = {name: name, image: image, description: desc};
    //create new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
             res.redirect("/campgrounds");
        }
    });

});
//------New Route----------
app.get("/campgrounds/new", function(req, res){
    res.render("campgrounds/new");
});
//-----Show Route------
app.get("/campgrounds/:id", function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
         if(err){
            console.log(err);
        } else {
            //console.log(foundCampground);
            //render the show page
            res.render("campgrounds/show", {campground: foundCampground}); 
        }
    });
});

//-------
//  Comments route
//-------

app.get("/campgrounds/:id/comments/new", function(req, res){
    //find camp by id
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        } else {
           res.render("comments/new", {campground: campground}); 
        }
    });
    
});

app.post("/campgrounds/:id/comments", function(req, res){
    //lookup camp using id
   Campground.findById(req.params.id, function(err, campground){
       if(err){
           console.log(err);
           res.redirect("/campgrounds");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err){
               console.log(err);
           } else {
               campground.comments.push(comment);
               campground.save();
               res.redirect('/campgrounds/' + campground._id);
           }
        });
       }
   });
   //create new comment
   //connect new comment to campground
   //redirect campground show page
});

//========SERVER=========================================

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("YelpCamp server has started"); 
});