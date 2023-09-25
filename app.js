const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// 静的ファイルを配信
app.use(express.static(path.join(__dirname, 'public')));

// APIエンドポイント
app.post('/submit', (req, res) => {
  console.log('Received data:', req.body);
  res.status(200).send('Data received');
});

// サーバー起動
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000/');
});