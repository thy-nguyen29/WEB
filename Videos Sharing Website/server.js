//======= Server setup =======//

const express = require("express");
const exphbs = require("express-handlebars");
const app = express();
const path = require("path");
const HTTP_PORT = process.env.PORT || 3030;
const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://dbUser:Tiggy2986@cluster0.jstjz5l.mongodb.net/?retryWrites=true&w=majority");

app.engine(".hbs", exphbs.engine({
    extname: ".hbs",
    helpers: {
        json: (context) => { return JSON.stringify(context) }
    }
}));

app.set("view engine", ".hbs");
app.use(express.urlencoded({extended: true}));
app.use(express.static("assets"));


const onHttpStart = () => {
    console.log(`Server is running on port ${HTTP_PORT}`)
    console.log(`Press CTRL+C to exit`)
    createDatabase();
}
app.listen(HTTP_PORT, onHttpStart);

//======= Database Definition =======//

const Schema = mongoose.Schema;
const videoSchema = new Schema({
    id:         String, 
    title:      String, 
    channel:    String, 
    likes:      Number, 
    image:      String, 
    date:       String
});
const Video = mongoose.model("videos_collections", videoSchema);
const commentSchema = new Schema({
    username:   String, 
    text:       String, 
    id:         String
});
const Comment = mongoose.model("comments_collections", commentSchema);

const createDatabase = async ()=>{
    const videoArr = [
        {
            id: "pPXYbJpuVyM",
            title: "Final Fantasy 7 Remake Review",
            channel: "IGN",
            image: "https://i.ytimg.com/vi/pPXYbJpuVyM/hqdefault.jpg",
            likes: "10",
            date: "04/06/2020"
        },
        {
            id: "sECY3EF5yt8",
            title: "Final Fantasy VII Remake - Review by Skill Up",
            channel: "Skill Up",
            image: "https://i.ytimg.com/vi/sECY3EF5yt8/hqdefault.jpg",
            likes: "12",
            date: "04/06/2020"
        },
        {
            id: "x8-ubYWnE7g",
            title: "Final Fantasy VII Remake Complete Story Explained",
            channel: "Xygor Gaming",
            image: "https://i.ytimg.com/vi/x8-ubYWnE7g/hqdefault.jpg",
            likes: "18",
            date: "04/14/2020"
        },
        {
            id: "dvYAqmQL8KU",
            title: "THE NEW REUNION: FINAL FANTASY 7 REMAKE SOLVED",
            channel: "Sleepezi",
            image: "https://i.ytimg.com/vi/dvYAqmQL8KU/hqdefault.jpg",
            likes: "23",
            date: "10/20/2021"
        },
        {
            id: "5ArRBeCx-y0",
            title: "Final Fantasy VII: Advent Children",
            channel: "YouTube Movies & Shows",
            image: "https://i.ytimg.com/vi/5ArRBeCx-y0/hqdefault.jpg",
            likes: "14",
            date: "12/02/2021"
        },
    ]

    const commentArr = [
        {username: "James",text:"AAAAA", id:"pPXYbJpuVyM"}, 
        {username:"John", text:"BBBBBBB", id:"sECY3EF5yt8"},
        {username:"Kate", text:"CCCCC", id:"x8-ubYWnE7g"},
        {username:"Ted", text:"DDDDDD", id:"dvYAqmQL8KU"},
        {username:"Kenny", text:"EEEEEEE", id:"5ArRBeCx-y0"}
    ]

let comCount =  await Comment.countDocuments({});
let vidCount =  await Video.countDocuments({});
if(comCount === 0 && vidCount === 0) {
    const comData =  await Comment.insertMany(commentArr);
    const vidData = await Video.insertMany(videoArr);
}
};

//======= Endpoints =======//

app.get("/", async (req, res) => {    
    const vidList = await Video.find().lean(); 
    return res.render("home", {layout: "layout", vid:vidList});
}); 

app.get("/home", async(req, res) => {
    try {
        const vidList = await Video.find().lean(); 
        return res.render("home", {layout: "layout", vid:vidList});
    }
    catch(err){
        console.log(err);
    }
});

app.get("/admin", async (req,res)=>{  
    try{
        const videoList = await Video.find().lean();        
        for(let i = 0; i < videoList.length;i++) {
            const comCount = await Comment.countDocuments({id:videoList[i].id}).lean();
            videoList[i].comCount = comCount;          
        }
       return res.render("admin", {layout:"layout",vid:videoList});    
    }
    catch(err){
        console.log(err);
    }
})

app.post("/search", async(req, res) => {

    try {
        const keyword = req.body.search;
        const result = await Video.find({
            $or: [
              { title: { $regex: keyword, $options: 'i' } },
              { channel: { $regex: keyword, $options: 'i' } }
            ]
          }).lean();
        const notFound = result.length === 0;
        return res.render("home", { layout: "layout", vid: result, noResult: notFound });
    } 
    catch (err) {
        console.log(err);
    }
});

app.post("/detail/:id", async (req,res)=>{  
    
    const vidId = req.params.id;
    try{
        const videoList = await Video.find({id:vidId}).lean();
        const commentList = await Comment.find({id:vidId}).lean();
       
        return res.render("details", {layout:"layout", vid:videoList, com:commentList});
    }
    catch(err) {
        console.log(err);
    }
})

app.post("/comment/:id", async (req, res) => {
    const vidId = req.params.id;
    const user = req.body.user;
    const com = req.body.com;

    try {
      const videoList = await Video.find({ id: vidId }).lean();
      const addComment = new Comment({ username: user, text: com, id: vidId });
      await addComment.save();
  
      const commentList = await Comment.find({ id: vidId }).lean();
      return res.render("details", { layout: "layout", vid: videoList, com: commentList });
    } 
    catch (err) {
      console.log(err);
    }
});

app.post("/addLike/:id", async (req,res)=>{  
    let vidId = req.params.id;
    let like = 0;
    
    try{
        const updateLike = await Video.findOne({id:vidId});
        updateLike.likes++;
        await updateLike.save();
        
        const videoList = await Video.find({id:vidId}).lean();
        const commentList= await Comment.find({id:vidId}).lean();
        return res.render("details", {layout:"layout", vid:videoList, com:commentList});
    }
    catch(err){
        console.log(err);
    }
   
})

app.post("/delete/:id", async (req,res)=>{  
    const vidId = req.params.id;
    try {
      const videoDeleteResult = await Video.deleteOne({ id: vidId });
      const commentDeleteResult = await Comment.deleteMany({ id: vidId });
      const videoList = await Video.find().lean();
              
      for (let i = 0; i < videoList.length; i++) {
        const comCount = await Comment.countDocuments({ id: videoList[i].id }).lean();
        videoList[i].comCount = comCount;
      }
      res.render("admin", { layout: "layout", vid: videoList });
    } 
    catch (error) {
      console.log(error);
    }
})

