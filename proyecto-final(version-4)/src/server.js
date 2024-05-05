const express = require('express');
const app = express();
const port = 3001;

app.get('/api', (req, res) => {
  res.send({ message: 'Hello from Express!' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});