const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const app = express();
const fileUpload = require('express-fileupload');
const path = require('path');
const multer  = require('multer');

app.use(express.static('webapp'));
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use('/upload', express.static(path.join(__dirname, 'upload')));
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).send('Something broke!');
});



const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'crisscolfer1', 
  database: 'stock' 
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

/* -------------- POST START -------------*/
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

app.post('/addProduct', (req, res) => {
  const { ProductName, ProductCode, Quantity, ExtendedPrice, CategoryId, SubCategoryId, SizeId, ColorId, ImageUrl } = req.body;

  const sql = `INSERT INTO Products (ProductName, ProductCode, Quantity, ExtendedPrice, CategoryId, SubCategoryId, SizeId, ColorId, ImageUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  connection.query(sql, [ProductName, ProductCode, Quantity, ExtendedPrice, CategoryId, SubCategoryId, SizeId, ColorId, ImageUrl], (error, results) => {
      if (error) {
          console.error('Ekleme hatası:', error);
          return res.status(500).json({ error: "Ürün ekleme sırasında hata oluştu" });
      }

      const newProductId = results.insertId;

      const query = `SELECT * FROM Products WHERE ProductID = ?`;
      connection.query(query, [newProductId], (error, results) => {
          if (error) {
              console.error('Ürün bilgisi alma hatası:', error);
              return res.status(500).json({ error: "Yeni ürün bilgisi alınamadı" });
          }
          res.json({ message: "Ürün başarıyla eklendi", newProduct: results[0] });
      });
  });
});
app.post('/addCategory', (req, res) => {
  const { CategoryName} = req.body;

  const sql = `INSERT INTO Categories (CategoryName) VALUES (?)`;
  
  connection.query(sql, [CategoryName], (error, results) => {
    if (error) {
      console.error('Ekleme hatası:', error);
      return res.status(500).json({ error: "Kategori ekleme sırasında hata oluştu" });
    }
    res.json({ message: "Kategori başarıyla eklendi", newProduct: results[0] });
  });
});
app.post('/addSubCategory', (req, res) => {
  const { SubCategoryName, CategoryId} = req.body;

  const sql = `INSERT INTO SubCategories (SubCategoryName, CategoryId) VALUES (?, ?)`;
  
  connection.query(sql, [SubCategoryName, CategoryId], (error, results) => {
    if (error) {
      console.error('Ekleme hatası:', error);
      return res.status(500).json({ error: "Alt kategori ekleme sırasında hata oluştu" });
    }
    res.json({ message: "Alt kategori başarıyla eklendi", newProduct: results[0] });
  });
});

/* -------------- POST END -------------*/
/* -------------- DELETE START -------------*/
app.delete('/deleteProduct/:id', (req, res) => {
  const productId = req.params.id;

  const sql = 'DELETE FROM Products WHERE ProductID = ?'; 
  connection.query(sql, [productId], (err, results) => {
      if (err) {
        console.log(err);
          return res.status(500).json({ message: 'Ürün silme işlemi başarısız.', error: err });
      }
      res.status(200).json({ message: 'Ürün başarıyla silindi.' });
  });
});
app.delete('/deleteSubCategory/:id', (req, res) => {
  const productId = req.params.id;

  const sql = 'DELETE FROM SubCategories WHERE SubCategoryID = ?'; 
  connection.query(sql, [productId], (err, results) => {
      if (err) {
        console.log(err);
          return res.status(500).json({ message: 'Ürün silme işlemi başarısız.', error: err });
      }
      res.status(200).json({ message: 'Ürün başarıyla silindi.' });
  });
});
/* -------------- DELETE END -------------*/
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'upload/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Dosya adını benzersiz yapmak için zaman damgası ekleniyor
  }
});
// Sadece resim dosyalarını kabul etme
const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Yalnızca resim dosyaları yüklenebilir!'));
    }
  }
});
app.post('/upload', upload.single('myFileUpload'), (req, res) => {
  console.log(req.body);
    console.log(req.file);
  try {
      if (req.file) {
          res.status(200).json({ message: 'Dosya başarıyla yüklendi!', file: req.file.filename });
      } else {
          console.error("Dosya yüklenemedi, req.file tanımsız.");
          res.status(400).json({ message: 'Dosya yüklenemedi!' });
      }
  } catch (error) {
      console.error("Hata oluştu:", error);
      res.status(500).json({ message: 'Sunucu hatası oluştu.' });
  }
});


app.get('/getCount', (req, res) => {
  const sql = 'SELECT Count(*) FROM Products WHERE Quantity<100';
  connection.query(sql, (error, results) => {
    if (error) {
      console.error('Sorgu hatası:', error);
      res.status(500).json({ error: 'Veritabanı hatası' });
      return;
    }
    res.json(results);
  });
});
app.get('/getProductCount', (req, res) => {
  const sql = 'SELECT Count(*) FROM Products';
  connection.query(sql, (error, results) => {
    if (error) {
      console.error('Sorgu hatası:', error);
      res.status(500).json({ error: 'Veritabanı hatası' });
      return;
    }
    res.json(results);
  });
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server ${port} portunda dinleniyor.`);
});