const express = require('express');
const path = require("path");
const oracledb = require('oracledb');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, "frontend")));

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});
// 🔐 Oracle Database Connection Configuration
// const dbConfig = {
//   user: "goodreads",        // your Oracle username
//   password: "Riyaz8688557396",   // your Oracle password
//   connectString: "localhost/XEPDB1" // service name or TNS
// };
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECT
};
// 🟢 API route to search books by title
app.get('/api/books/search', async (req, res) => {
  const title = req.query.title;   // e.g. /api/books/search?title=Harry Potter
let connection;
  try {

    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT * FROM goodreads WHERE title LIKE :title`,
      [`%${title}%`],
      // `SELECT title, authorId, rating, ratingCount, reviewCount FROM goodreads WHERE title LIKE :title`,
      // [title],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
      
    );
    console.table(result.rows);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});





// 🟢 API route to get all goodreads data
app.get('/api/books', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(`SELECT title,
    authorId,
    rating,
    ratingCount,
    reviewCount
     FROM goodreads ORDER BY authorId`,[],{ outFormat: oracledb.OUT_FORMAT_OBJECT });


    console.log('Details Of goodreads:');
    console.table(result.rows);
    res.json(result.rows);   // send the rows as JSON
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});









// API route to get single row 
app.get('/api/books/:id', async (req, res) => {
  const {id}= req.params;

  if (isNaN(id)) {
    return res.status(400).json({ message: 'Invalid book ID' });
  }

  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT link,title,onlineStores FROM goodreads WHERE  authorId = :id`,[id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Book not found' });
    } else {
      // const columns = result.metaData.map(col => col.name);

      // console.log('Columns:', columns);
      // console.table(result.rows);
      const columns = result.metaData.map(col => col.name);

const formattedRows = result.rows.map(row => {
  let obj = {};
  columns.forEach((colName, index) => {
    obj[colName] = row[index];
  });
  return obj;
});

console.table(formattedRows);
    }

  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  } finally {
    if (connection) await connection.close();
  }
});



// API route to add new book
app.post('/api/books', async (req, res) => {
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores
  } = req.body; // get values from request body

  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    const sql = `
      INSERT INTO goodreads 
      (title, authorId, rating, ratingCount, reviewCount, description, pages, dateOfPublication, editionLanguage, price, onlineStores)
      VALUES (:title, :authorId, :rating, :ratingCount, :reviewCount, :description, :pages, :dateOfPublication, :editionLanguage, :price, :onlineStores)
    `;

    const binds = {
      title,
      authorId,
      rating,
      ratingCount,
      reviewCount,
      description,
      pages,
      dateOfPublication:new Date("2025-10-16"),   // pass as string or JS Date
      editionLanguage,
      price,
      onlineStores
    };

    const result = await connection.execute(sql, binds, { autoCommit: true });
    const result1=result.lastRowid
    console.log('last inserted id:',result1)

    console.log('Rows inserted:', result.rowsAffected);
    res.send({ message: 'Book added successfully', rowsInserted: result.rowsAffected });

  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  } finally {
    if (connection) await connection.close();
  }
});


// API route to update a book
app.put('/api/books/:id', async (req, res) => {
  const {id} = req.params;  // Record to update
  const { title, authorId, rating,ratingCount,
      reviewCount,
      description,
      pages,
      dateOfPublication,   // pass as string or JS Date
      editionLanguage,
      price,
      onlineStores } = req.body;  // New data (from frontend)
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `UPDATE goodreads 
       SET title = :title, authorId = :authorId, rating = :rating, ratingCount = :ratingCount, reviewCount = :reviewCount, description = :description, pages = :pages, dateOfPublication = TO_DATE(:dateOfPublication, 'YYYY-MM-DD'), editionLanguage = :editionLanguage, price = :price, onlineStores = :onlineStores
       WHERE authorId = :id`,
      [title, authorId, rating, ratingCount, reviewCount, description, pages, dateOfPublication, editionLanguage, price, onlineStores, id],
      { autoCommit: true }
    );

    if (result.rowsAffected > 0) {
      console.log({ message: `✅ Record with ID ${id} updated successfully` });
    } else {
      res.status(404).json({ message: `⚠️ Record with ID ${id} not found` });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});






// API route to delete a book
app.delete('/api/books/:id', async (req, res) => {
  const {id} = req.params;
 let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `DELETE FROM goodreads WHERE authorId = :id`,
      [id],
      { autoCommit: true }
    );

    if (result.rowsAffected > 0) {
      console.log({ message: `Record with ID ${id} deleted successfully` });
      
    } else {
      res.status(404).json({ message: 'Record not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});










// 🟢 Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
