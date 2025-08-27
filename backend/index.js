// import express from 'express';
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
