const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const application = express();
const CategoryController = require("./controllers/CategoryController");
const ItemDescriptionController = require("./controllers/ItemDescriptionController");
const ItemController = require("./controllers/ItemController");

const db = new sqlite3.Database("data.db", (error) => {
  if (error) {
    console.log("Error connecting to the database", error.message);
  }
  else {
    console.log("ok connected to the database");
  }
});

application.use(express.json());
application.use(cors());

application.get("/ping", (request, response) => {
  return response.json({
    message: "pong"
  });
});

new CategoryController(application, db);
new ItemDescriptionController(application, db);
new ItemController(application, db);

const PORT = process.env.PORT || 3001;
application.listen(PORT, () => {
  console.log(`server started at port ${PORT}...`);
})