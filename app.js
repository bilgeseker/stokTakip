const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const app = express();

// CORS middleware'ini ekleyin (SAPUI5'in API'ye erişmesini sağlar)
app.use(cors());
app.use(express.json());

// MySQL veritabanına bağlantı
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'crisscolfer1',  // MySQL şifrenizi buraya ekleyin
  database: 'stock'  // Veritabanı adınızı buraya ekleyin
});

connection.connect((err) => {
  if (err) {
    console.error('Veritabanı bağlantı hatası: ' + err.stack);
    return;
  }
  console.log('Veritabanına başarıyla bağlandı.');
});

/* -------------- GET START -------------*/
app.get('/products', (req, res) => {
  const sql = `
  SELECT 
      ProductID,
      ProductName,
      ProductCode,
      Quantity,
      ExtendedPrice,
      CategoryId,
      SubCategoryId,
      SizeId,
      ColorId,
      ImageUrl
  FROM 
      Products 
`;
  connection.query(sql, (error, results) => {
    if (error) {
      console.error('Sorgu hatası:', error);
      res.status(500).json({ error: 'Veritabanı hatası' });
      return;
    }
    res.json(results); 
  });
});

app.get('/sizes', (req, res) => {
  const sql = 'SELECT * FROM Sizes';
  connection.query(sql, (error, results) => {
    if (error) {
      console.error('Sorgu hatası:', error);
      res.status(500).json({ error: 'Veritabanı hatası' });
      return;
    }
    res.json(results);
  });
});

app.get('/colors', (req, res) => {
  const sql = 'SELECT * FROM Colors';
  connection.query(sql, (error, results) => {
    if (error) {
      console.error('Sorgu hatası:', error);
      res.status(500).json({ error: 'Veritabanı hatası' });
      return;
    }
    res.json(results);
  });
});

app.get('/categories', (req, res) => {
  const sql = 'SELECT * FROM Categories';
  connection.query(sql, (error, results) => {
    if (error) {
      console.error('Sorgu hatası:', error);
      res.status(500).json({ error: 'Veritabanı hatası' });
      return;
    }
    res.json(results);
  });
});
app.get('/subCategories', (req, res) => {
  const sql = 'SELECT * FROM SubCategories';
  connection.query(sql, (error, results) => {
    if (error) {
      console.error('Sorgu hatası:', error);
      res.status(500).json({ error: 'Veritabanı hatası' });
      return;
    }
    res.json(results);
  });
});
/* -------------- GET END -------------*/

/* -------------- PUT START -------------*/
app.post('/updateProduct', (req, res) => {
  const { ProductID, ProductName, ProductCode, Quantity, ExtendedPrice, CategoryId, SubCategoryId, SizeId, ColorId, ImageUrl } = req.body;
console.log(req.body);
  const sql = `
      UPDATE Products 
      SET 
          ProductName = ?, 
          ProductCode = ?, 
          Quantity = ?, 
          ExtendedPrice = ?, 
          CategoryId = ?, 
          SubCategoryId = ?, 
          SizeId = ?, 
          ColorId = ?, 
          ImageUrl = ? 
      WHERE ProductID = ?;
  `;

  const values = [ProductName, ProductCode, Quantity, ExtendedPrice, CategoryId, SubCategoryId, SizeId, ColorId, ImageUrl, ProductID];

  connection.query(sql, values, (error, results) => {
      if (error) {
          console.error('Güncelleme hatası:', error);
          res.status(500).json({ error: 'Güncelleme sırasında hata oluştu' });
          return;
      }
      res.json({ message: 'Ürün başarıyla güncellendi' });
  });
});

/* -------------- PUT END -------------*/
const port = 3000;
app.listen(port, () => {
    console.log(`Server ${port} portunda dinleniyor.`);
});