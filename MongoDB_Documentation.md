# MongoDB: The Complete Guide
*From Beginner to Advanced*

---

## Table of Contents
1. [Introduction to MongoDB](#1-introduction-to-mongodb)
2. [MongoDB Basics](#2-mongodb-basics)
3. [MongoDB Installation & Setup](#3-mongodb-installation--setup)
4. [MongoDB Shell & Commands](#4-mongodb-shell--commands)
5. [Query Operators](#5-query-operators)
6. [Indexing](#6-indexing)
7. [Aggregation Framework](#7-aggregation-framework)
8. [Schema Design & Data Modeling](#8-schema-design--data-modeling)
9. [MongoDB with JavaScript (Node.js)](#9-mongodb-with-javascript-nodejs)
10. [MongoDB with Express.js](#10-mongodb-with-expressjs)
11. [MongoDB with React](#11-mongodb-with-react)
12. [Mongoose](#12-mongoose)
13. [Authentication & Security](#13-authentication--security)
14. [Error Handling & Best Practices](#14-error-handling--best-practices)
15. [Mini Projects & Examples](#15-mini-projects--examples)

---

## 1. Introduction to MongoDB

### What is MongoDB?
MongoDB is an open-source, document-oriented, NoSQL database designed for high volume data storage. Unlike traditional relational databases (SQL) that use tables and rows, MongoDB makes use of collections and documents. Documents consist of key-value pairs which are the basic unit of data in MongoDB.

### Why MongoDB is used?
*   **Flexibility:** The schema-less nature allows for storing different data structures in the same collection.
*   **Scalability:** It supports horizontal scaling (sharding) out of the box.
*   **High Performance:** Indexing and replication features ensure fast queries and high availability.
*   **Rich Queries:** Supports powerful query expressions and aggregation.

### MongoDB vs SQL Databases

| Feature | SQL (Relational) | MongoDB (NoSQL) |
| :--- | :--- | :--- |
| **Data Structure** | Tables, Rows, Columns | Collections, Documents |
| **Schema** | Fixed Schema | Dynamic Schema |
| **Relations** | Joins | Embedded Documents / References |
| **Scaling** | Vertical (Scale Up) | Horizontal (Scale Out) |
| **Query Language** | SQL | MQL (MongoDB Query Language) |

### Real-world Use Cases
*   **Content Management Systems (CMS):** Storing diverse content types.
*   **Big Data & Analytics:** Handling massive volumes of unstructured data.
*   **Product Catalogs:** E-commerce sites with varying product attributes.
*   **Mobile Apps:** Flexible data structure for evolving app requirements.

---

## 2. MongoDB Basics

### Database, Collection, Document Explained
*   **Database:** A container for collections. Each database has its own set of files on the file system.
*   **Collection:** A group of MongoDB documents. It is the equivalent of an RDBMS table.
*   **Document:** A set of key-value pairs. Documents have dynamic schema. Dynamic schema means that documents in the same collection do not need to have the same set of fields or structure, and common fields in a collection's documents may hold different types of data.

### BSON vs JSON
MongoDB stores data in **BSON** (Binary JSON).
*   **JSON (JavaScript Object Notation):** A text-based data interchange format.
*   **BSON:** A binary representation of JSON-like documents. It contains more data types than JSON (e.g., Date, Binary data) and is optimized for speed and space.

### The `_id` Field
Every document in MongoDB requires a unique `_id` field that acts as a primary key. If you don't provide one, MongoDB will automatically generate a unique `ObjectId` for you.

### Data Types in MongoDB
Common data types include:
*   **String:** UTF-8 string.
*   **Integer:** 32-bit or 64-bit integer.
*   **Boolean:** `true` or `false`.
*   **Double:** Floating point number.
*   **Date:** Current date or time.
*   **Array:** Arrays or lists of values.
*   **Object:** Embedded documents.
*   **ObjectId:** Unique ID for the document.
*   **Null:** Null value.

---

## 3. MongoDB Installation & Setup

### Installing MongoDB Locally

#### Windows
1.  Download the MSI installer from the [MongoDB Download Center](https://www.mongodb.com/try/download/community).
2.  Run the installer.
3.  Choose "Complete" setup.
4.  Select "Install MongoDB as a Service".
5.  (Optional) Install MongoDB Compass.
6.  Complete the installation.

#### Linux (Ubuntu)
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

#### Mac (Homebrew)
```bash
brew tap mongodb/brew
brew install mongodb-community@6.0
brew services start mongodb/brew/mongodb-community
```

### MongoDB Compass
MongoDB Compass is a GUI (Graphical User Interface) for MongoDB. It allows you to visually explore your data, run queries, and manage your database without using the command line.

### MongoDB Atlas (Cloud)
MongoDB Atlas is a fully managed cloud database service.
1.  Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  Sign up and create an account.
3.  Build a Database (Select the "Shared" free tier for learning).
4.  Create a Cluster.
5.  Create a database user and allow network access (IP Whitelist).

### Connecting to Atlas Cluster
To connect, you get a connection string like:
`mongodb+srv://<username>:<password>@cluster0.mongodb.net/test`
You can use this string in your application code or MongoDB Compass.

---

## 4. MongoDB Shell & Commands

The `mongosh` (MongoDB Shell) is an interactive JavaScript interface to MongoDB.

### Database Commands

#### `show dbs`
Lists all databases on the server.
```javascript
show dbs
```

#### `use databaseName`
Switches to `databaseName`. If it doesn't exist, it will be created when you first store data.
```javascript
use myDatabase
```

#### `db`
Shows the current database you are using.
```javascript
db
```

#### `db.dropDatabase()`
Deletes the current database.
```javascript
use myDatabase
db.dropDatabase()
```

### Collection Commands

#### `show collections`
Lists all collections in the current database.
```javascript
show collections
```

#### `db.createCollection()`
Explicitly creates a collection.
```javascript
db.createCollection("users")
```

#### `db.collection.drop()`
Removes a collection from the database.
```javascript
db.users.drop()
```

### CRUD Operations

#### Create (Insert)
*   **`insertOne()`**: Inserts a single document.
    ```javascript
    db.users.insertOne({ name: "Alice", age: 25, city: "New York" })
    ```
*   **`insertMany()`**: Inserts multiple documents.
    ```javascript
    db.users.insertMany([
      { name: "Bob", age: 30, city: "London" },
      { name: "Charlie", age: 35, city: "Paris" }
    ])
    ```

#### Read (Find)
*   **`find()`**: Retrieves documents.
    ```javascript
    // Find all documents
    db.users.find()
    
    // Find documents with a filter
    db.users.find({ age: 25 })
    ```
*   **`findOne()`**: Retrieves the first document matching the filter.
    ```javascript
    db.users.findOne({ name: "Alice" })
    ```

#### Update
*   **`updateOne()`**: Updates the first document that matches the filter.
    ```javascript
    // Update Alice's age to 26
    db.users.updateOne(
      { name: "Alice" },
      { $set: { age: 26 } }
    )
    ```
*   **`updateMany()`**: Updates all documents that match the filter.
    ```javascript
    // Update all users in London to be active
    db.users.updateMany(
      { city: "London" },
      { $set: { status: "active" } }
    )
    ```

#### Delete
*   **`deleteOne()`**: Deletes the first document matching the filter.
    ```javascript
    db.users.deleteOne({ name: "Alice" })
    ```
*   **`deleteMany()`**: Deletes all documents matching the filter.
    ```javascript
    db.users.deleteMany({ age: { $gt: 30 } })
    ```

---

## 5. Query Operators

Query operators provide ways to locate data within the database.

### Comparison Operators
*   **`$eq`**: Matches values that are equal to a specified value.
    ```javascript
    db.users.find({ age: { $eq: 25 } }) // Same as { age: 25 }
    ```
*   **`$ne`**: Matches all values that are not equal to a specified value.
    ```javascript
    db.users.find({ age: { $ne: 25 } })
    ```
*   **`$gt`**: Matches values that are greater than a specified value.
    ```javascript
    db.users.find({ age: { $gt: 25 } })
    ```
*   **`$lt`**: Matches values that are less than a specified value.
    ```javascript
    db.users.find({ age: { $lt: 25 } })
    ```
*   **`$gte`** / **`$lte`**: Greater than or equal / Less than or equal.

### Logical Operators
*   **`$and`**: Joins query clauses with a logical AND returns all documents that match the conditions of both clauses.
    ```javascript
    db.users.find({ $and: [ { age: 25 }, { city: "New York" } ] })
    ```
*   **`$or`**: Joins query clauses with a logical OR returns all documents that match the conditions of either clause.
    ```javascript
    db.users.find({ $or: [ { age: 25 }, { city: "London" } ] })
    ```
*   **`$not`**: Inverts the effect of a query expression.
    ```javascript
    db.users.find({ age: { $not: { $gt: 25 } } })
    ```

### Array Operators
*   **`$in`**: Matches any of the values specified in an array.
    ```javascript
    db.users.find({ city: { $in: ["New York", "London"] } })
    ```
*   **`$all`**: Matches arrays that contain all elements specified in the query.
    ```javascript
    db.products.find({ tags: { $all: ["electronics", "apple"] } })
    ```

### Projection
Projection determines which fields are returned in the matching documents.
```javascript
// Return only name and city (1 means include, 0 means exclude)
// _id is included by default, so we explicitly exclude it if needed
db.users.find({}, { name: 1, city: 1, _id: 0 })
```

### Sorting and Pagination
*   **`sort()`**: Sorts the results. 1 for ascending, -1 for descending.
    ```javascript
    db.users.find().sort({ age: 1 })
    ```
*   **`limit()`**: Limits the number of documents returned.
    ```javascript
    db.users.find().limit(5)
    ```
*   **`skip()`**: Skips a specified number of documents. Useful for pagination.
    ```javascript
    // Page 2 (assuming 10 items per page)
    db.users.find().skip(10).limit(10)
    ```

---

## 6. Indexing

### What are Indexes?
Indexes support the efficient execution of queries in MongoDB. Without indexes, MongoDB must perform a *collection scan*, i.e., scan every document in a collection, to select those documents that match the query statement.

### Types of Indexes
*   **Single Field Index:** Index on a single field.
*   **Compound Index:** Index on multiple fields.
*   **Multikey Index:** Index on array content.
*   **Text Index:** Supports search of string content.

### Creating and Deleting Indexes
*   **Create Index:**
    ```javascript
    // Create an ascending index on the 'name' field
    db.users.createIndex({ name: 1 })
    ```
*   **Delete Index:**
    ```javascript
    db.users.dropIndex("name_1")
    ```

### Performance Benefits
Indexes significantly reduce the amount of data MongoDB needs to process. Use `explain()` to see query performance.
```javascript
db.users.find({ name: "Alice" }).explain("executionStats")
```

---

## 7. Aggregation Framework

### What is Aggregation?
Aggregation operations process data records and return computed results. They group values from multiple documents together, and can perform a variety of operations on the grouped data to return a single result.

### Pipeline Concept
The aggregation framework is modeled on the concept of data processing pipelines. Documents enter a multi-stage pipeline that transforms the documents into aggregated results.

### Common Stages
*   **`$match`**: Filters the documents (like `find`).
*   **`$group`**: Groups documents by a specified key.
*   **`$project`**: Reshapes each document in the stream (selects fields).
*   **`$sort`**: Sorts the documents.
*   **`$limit`**: Limits the number of documents.

### Real-world Aggregation Examples
**Scenario:** Calculate the total sales for each product.
```javascript
db.sales.aggregate([
  // Stage 1: Filter for completed orders
  { $match: { status: "completed" } },
  
  // Stage 2: Group by product and sum the amount
  { $group: { _id: "$productId", totalAmount: { $sum: "$amount" } } },
  
  // Stage 3: Sort by totalAmount descending
  { $sort: { totalAmount: -1 } }
])
```

---

## 8. Schema Design & Data Modeling

### Embedded vs Referenced Documents

#### Embedded Data Model (Denormalization)
Related data is stored within a single document.
*   **Pros:** Fewer queries (better read performance), atomic updates.
*   **Cons:** Large document size, data duplication.
*   **Use Case:** One-to-Few relationships, data that is viewed together.

**Example:**
```json
{
  "_id": "user1",
  "name": "Alice",
  "address": {
    "street": "123 Main St",
    "city": "New York"
  }
}
```

#### Referenced Data Model (Normalization)
Related data is stored in separate documents and linked by `_id`.
*   **Pros:** Smaller documents, no duplication.
*   **Cons:** Multiple queries (joins) needed to retrieve data.
*   **Use Case:** One-to-Many (large), Many-to-Many.

**Example:**
```json
// User Document
{ "_id": "user1", "name": "Alice" }

// Order Document
{ "_id": "order1", "user_id": "user1", "total": 50 }
```

### Relationships
*   **One-to-One:** Usually embedded.
*   **One-to-Many:** Embedded if "few", Referenced if "many".
*   **Many-to-Many:** Referenced.

### Best Practices
*   Design your schema based on your application's access patterns.
*   Embed data when it is used together.
*   Reference data when it is accessed independently or grows indefinitely.

---

## 9. MongoDB with JavaScript (Node.js)

### Installing MongoDB Driver
```bash
npm install mongodb
```

### Connecting MongoDB with Node.js
```javascript
const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("Connected successfully to server");
    const db = client.db("myDatabase");
    const collection = db.collection("users");
    
    // Perform operations...
    
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
```

### CRUD Examples using JavaScript
```javascript
// Insert
const insertResult = await collection.insertOne({ name: "David", age: 28 });
console.log('Inserted documents =>', insertResult);

// Find
const findResult = await collection.find({}).toArray();
console.log('Found documents =>', findResult);
```

### Async/Await Examples
Modern MongoDB drivers fully support Promises and Async/Await, making the code cleaner and easier to read compared to callbacks.

---

## 10. MongoDB with Express.js

### Creating Express Server
First, initialize a project and install dependencies:
```bash
npm init -y
npm install express mongoose
```

### Connecting MongoDB using Mongoose
Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js.

```javascript
const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

mongoose.connect('mongodb://localhost:27017/my_express_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Define a Schema and Model
const UserSchema = new mongoose.Schema({
  name: String,
  email: String
});
const User = mongoose.model('User', UserSchema);

// REST API Examples

// GET all users
app.get('/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// POST a new user
app.post('/users', async (req, res) => {
  const newUser = new User(req.body);
  await newUser.save();
  res.json(newUser);
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
```

---

## 11. MongoDB with React

### How React Communicates with MongoDB
React is a frontend library, so it cannot connect directly to MongoDB for security reasons. Instead, it communicates with a backend server (like Express.js) via HTTP requests (API calls), and the backend interacts with the database.

**Flow:** React (Frontend) <-> Express (Backend) <-> MongoDB (Database)

### Fetching Data from Express + MongoDB
In a React component, use `useEffect` and `fetch` (or Axios) to get data.

```javascript
import React, { useState, useEffect } from 'react';

function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/users')
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  return (
    <div>
      <h2>User List</h2>
      <ul>
        {users.map(user => (
          <li key={user._id}>{user.name} - {user.email}</li>
        ))}
      </ul>
    </div>
  );
}
export default UserList;
```

### Form Submission Example
Sending data to the backend to be saved in MongoDB.

```javascript
function AddUser() {
  const [name, setName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:3000/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    alert('User added!');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="text" 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
        placeholder="Enter name" 
      />
      <button type="submit">Add User</button>
    </form>
  );
}
```

---

## 12. Mongoose

### What is Mongoose?
Mongoose is an ODM (Object Data Modeling) library for MongoDB and Node.js. It manages relationships between data, provides schema validation, and is used to translate between objects in code and the representation of those objects in MongoDB.

### Schema and Models
*   **Schema:** Defines the structure of the document, default values, validators, etc.
*   **Model:** A wrapper for the schema. It provides an interface to the database for creating, querying, updating, deleting records, etc.

```javascript
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  age: { type: Number, min: 18, max: 65 },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
```

### Validation
Mongoose has built-in validation.
*   `required`: Boolean, specifies that the field is mandatory.
*   `min` / `max`: For numbers.
*   `enum`: Checks if the value is in a given array of strings.

### Relationships
Mongoose allows you to reference documents in other collections.

```javascript
const postSchema = new mongoose.Schema({
  title: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Post = mongoose.model('Post', postSchema);

// Populating the author field
Post.find().populate('author').then(posts => {
  console.log(posts);
});
```

---

## 13. Authentication & Security

### Environment Variables
Never hardcode sensitive information like database connection strings or passwords. Use environment variables.
1.  Install `dotenv`: `npm install dotenv`
2.  Create a `.env` file:
    ```
    MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
    PORT=3000
    ```
3.  Use in code:
    ```javascript
    require('dotenv').config();
    mongoose.connect(process.env.MONGO_URI);
    ```

### MongoDB Atlas Security
*   **Network Access (IP Whitelist):** Only allow trusted IP addresses to connect.
*   **Database Users:** Create users with specific roles (e.g., `readWrite`, `readOnly`). Do not use the admin user for your application.

### Preventing Common Vulnerabilities
*   **Injection Attacks:** Mongoose sanitizes inputs by default, but be careful with raw queries.
*   **NoSQL Injection:** Avoid passing user input directly to query operators.

---

## 14. Error Handling & Best Practices

### Common MongoDB Errors
*   **Connection Refused:** Database server is not running or incorrect port.
*   **Authentication Failed:** Wrong username/password or database name.
*   **Duplicate Key Error:** Trying to insert a document with a unique field that already exists (often `_id` or unique indexes).

### Debugging Tips
*   Use `console.log` to check query results.
*   Use MongoDB Compass to verify data state.
*   Enable Mongoose debug mode: `mongoose.set('debug', true);` to see the underlying queries.

### Production Best Practices
*   **Indexing:** Ensure all queries are covered by indexes.
*   **Replication:** Use a Replica Set for high availability.
*   **Backups:** Regularly back up your data (Atlas does this automatically).
*   **Monitoring:** Use tools like MongoDB Atlas Charts or Prometheus to monitor performance.

---

## 15. Mini Projects & Examples

### User Management System
**Goal:** Create a simple API to manage users.
*   **Features:** Register, Login, Get Profile, Update Profile, Delete Account.
*   **Tech Stack:** Node.js, Express, Mongoose.

### CRUD Application
**Goal:** A "To-Do List" app.
*   **Features:** Add task, Mark as done, Delete task, Filter tasks.
*   **Tech Stack:** React (Frontend), Express (Backend), MongoDB (Database).

### MERN Stack Sample Workflow
1.  **Setup:** Create `client` (React) and `server` (Node/Express) folders.
2.  **Backend:**
    *   Connect to MongoDB Atlas.
    *   Create `Task` model.
    *   Create API routes (`/api/tasks`).
3.  **Frontend:**
    *   Create components (`TaskList`, `AddTask`).
    *   Fetch data from API.
    *   Display data and handle forms.
4.  **Integration:** Ensure frontend sends requests to the correct backend port.

---
*End of Documentation*
