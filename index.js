const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from the 'public' directory

// Create or open the SQLite database
const db = new sqlite3.Database('./product_inventory.db', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Create Product Table if it doesn't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    type TEXT,
    quantity INTEGER,
    price REAL
  )`, (err) => {
    if (err) {
      console.error('Error creating products table:', err.message);
    }
  });
});

// Route to add a product
app.post('/v1/product', (req, res) => {
  const { name, description, type, quantity, price } = req.body;
  const sql = `INSERT INTO products (name, description, type, quantity, price) VALUES (?, ?, ?, ?, ?)`;
  
  db.run(sql, [name, description, type, quantity, price], function(err) {
    if (err) {
      console.error('Error inserting product:', err.message);
      return res.status(500).send('Error inserting product');
    }
    // Respond with the newly created product ID
    res.redirect('/'); // Redirect to home after insertion
  });
});

// Route to get all products for display
app.get('/v1/products', (req, res) => {
  db.all(`SELECT * FROM products`, [], (err, rows) => {
    if (err) {
      console.error('Error retrieving products:', err.message);
      return res.status(500).send('Error retrieving products');
    }
    res.json(rows); // Respond with the products in JSON format
  });
});

// Route to edit a product
app.put('/v1/product/:id', (req, res) => {
    const id = req.params.id;
    const { name, description, type, quantity, price } = req.body;
    
    const sql = `UPDATE products SET name = ?, description = ?, type = ?, quantity = ?, price = ? WHERE id = ?`;
    
    db.run(sql, [name, description, type, quantity, price, id], function(err) {
      if (err) {
        console.error('Error updating product:', err.message);
        return res.status(500).send('Error updating product');
      }
      res.sendStatus(200); // Send success response
    });
  });
  
  // Route to delete a product
  app.delete('/v1/product/:id', (req, res) => {
    const id = req.params.id;
    
    const sql = `DELETE FROM products WHERE id = ?`;
    
    db.run(sql, id, function(err) {
      if (err) {
        console.error('Error deleting product:', err.message);
        return res.status(500).send('Error deleting product');
      }
      res.sendStatus(200); // Send success response
    });
  });
  

// Serve the HTML file (replace 'index.html' with your HTML file)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
