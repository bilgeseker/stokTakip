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
