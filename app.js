//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
var _ = require('lodash');

const app = express();
const day = date.getDate();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Admin_Prathamesh:test123@cluster0.41l4d.mongodb.net/todolistDB");

const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Buy Food"
});
const item2 = new Item({
  name: "Cook Food"
});
const item3 = new Item({
  name: "Eat Food"
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  Item.find({}, (err, items) => {
    if (items.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully Inserted");
        }
      });
      res.redirect("/");
    } else {
      if (err) {
        console.log(err);
      } else {
        res.render("list", {
          listTitle: day,
          newListItems: items
        });
      }
    }
  });
});

app.get("/:customListname", (req, res) => {
  const customListname = _.capitalize(req.params.customListname);

  List.findOne({
    name: customListname
  }, (err, customList) => {
    if (err) {
      console.log(err);
    } else {
      if (!customList) {
        const list = new List({
          name: customListname,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListname);
      } else {
        res.render("list", {
          listTitle: customListname,
          newListItems: customList.items
        });
      }
    }
  });
});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });
  if (listName === day) {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, (err, foundList) => {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
    });
  }
});

app.post("/delete", (req, res) => {
  const deleteItem = req.body.checkBox;
  const listName = req.body.listName;

  if(listName === day){
    Item.findByIdAndRemove(deleteItem, (err) => {
      if (err) {
        console.log(err);
      }
    });
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: deleteItem}}}, (err, foundList)=>{
      if(!err){
        res.redirect("/"+ listName);
      }
    });
  }
});


app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
