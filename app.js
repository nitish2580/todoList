const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
const mongoose = require("mongoose");
const _=require("lodash");
// Set up default mongoose connection
mongoose
  .connect(
    "mongodb+srv://nitish2580:testing123@cluster0.nbe3tw8.mongodb.net/todolistDB",
    {
      // usecorrectindex:true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connection successfull......"))
  .catch((err) => console.log(err));


// Todo list Schema
const itemsSchema = new mongoose.Schema({
  name: String,
});
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema],
});
// model creation
const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listSchema);
//create documents

const createItems = async () => {
  try {
    const item1 = new Item({
      name: "Welcome to your todolist",
    });
    const item2 = new Item({
      name: "Hit the + button to aff a new item.",
    });
    const item3 = new Item({
      name: "<--Hit this to delete an item.",
    });
    const defaultItems = [item1, item2, item3];
    const result = await Item.insertMany(defaultItems);
    // console.log(result);
  } catch (err) {
    console.log(err);
  }
};

const deleteDocument = async (_id) => {
  try {
    const result = await Item.findByIdAndDelete(_id);
    console.log(result);
  } catch (err) {
    console.log(err);
  }
};
// const defaultItems=[item1,item2,item3];

let items = [];
let workItems = [];
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

// dynamic directory
app.use(express.static("public"));

app.get("/", (req, res) => {
  weekday = new Array(
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  );
  const today = new Date();
  var options = {
    weekday: "long",
    day: "numeric",
    month: "long",
  };
  var day = today.toLocaleDateString("en-US", options);
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      createItems();
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newItems: foundItems });
    }
  });
  // res.render("list", { listTitle: day, newItems: items });
  //   res.send(weekday[today.getDay()]);
});

app.post("/", (req, res) => {
  const tasks = req.body.tasksList;
  const listName = req.body.list;
  const item = new Item({
    name: tasks,
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", (req, res) => {
  const listName=req.body.listName;
  const checkedItem=req.body.checkbox;
  deleteDocument(checkedItem);
  if (listName === "Today") {
    res.redirect("/");
  } else {
      List.findOneAndUpdate(
        {name:listName},
        {$pull:{items:{_id:checkedItem}}},
        (err,foundItems)=>{
          if(!err){
            res.redirect("/"+listName);
          }
        }
      )
  }
});

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName}, function (err, foundList) {
    if (!err) 
    {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: [],
        });
        list.save();
        res.redirect("/"+customListName)
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newItems: foundList.items,
        });
      }
    }
    else{console.log(err)}
  });

  const list = new List({
    name: customListName,
  });
  list.save();
});
app.post("/work", (req, res) => {
  let item = req.body.tasksList;
  workItems.push(item);
  res.redirect("/work");
});

app.listen(3000, () => {
  console.log("Successfully!! Running on port 3000");
});
