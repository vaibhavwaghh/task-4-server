const express = require("express");
const { MongoClient, ObjectID } = require("mongodb");
const cors = require("cors");
const dotenv = require("dotenv");

const app = express();
app.use(cors());
app.use(express.json());

dotenv.config({ path: `${__dirname}/config.env` });

const url = process.env.DATABASE;
const dbName = "task4Database";
const collectionName = "employees";

let client;

app.post("/addEmployee", async (req, res) => {
  try {
    client = new MongoClient(url, { useUnifiedTopology: true });
    await client.connect();

    const db = client.db(dbName);
    const coll = db.collection(collectionName);

    const record = {
      id: req.body.id,
      name: req.body.name,
      salary: req.body.salary,
    };

    const result = await coll.insertOne(record);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  } finally {
    if (client) client.close(); // Close the MongoDB connection in the finally block
  }
});

app.get("/api/employees", async (req, res) => {
  try {
    client = new MongoClient(url, { useUnifiedTopology: true });
    await client.connect();
    const db = client.db(dbName);
    const coll = db.collection(collectionName);

    const result = await coll.find().toArray();

    res.json(result);
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.close();
  }
});

app.post("/updateEmployee", async (req, res, next) => {
  try {
    const { id, name, salary } = req.body;
    console.log(req.body);

    client = new MongoClient(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();
    const db = client.db(dbName);
    const coll = db.collection(collectionName);

    // Check if employee with the given ID exists
    const doc = await coll.findOneAndUpdate(
      { id }, // Assuming id is a string representing the id field
      { $set: { name, salary } },
      { returnDocument: "after" } // This option returns the updated document
    );

    console.log(doc);

    if (!doc) {
      return res.status(404).json({ error: "Employee not found." });
    }

    res.status(200).json({
      status: "success",
      data: {
        document: "UPDATED THE document",
        doc,
      },
    });
  } catch (error) {
    console.error("Error updating employee:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.close();
  }
});

app.delete("/deleteEmployee/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    client = new MongoClient(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();
    const db = client.db(dbName);
    const coll = db.collection(collectionName);

    // Delete the employee by ID
    const result = await coll.deleteOne({ id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Employee not found." });
    }

    // Fetch the updated list of employees
    const updatedEmployees = await coll.find().toArray();

    res.json(updatedEmployees);
  } catch (error) {
    console.error("Error deleting employee:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.close();
  }
});

const PORT = 9005;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
