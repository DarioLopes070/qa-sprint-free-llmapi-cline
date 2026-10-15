const express = require('express');
const app = express();

// Health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

module.exports = app;