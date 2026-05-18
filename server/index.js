const express = require('express');
const cors = require('cors');
const path = require('path');
const itemsRouter = require('./routes/items');
const votesRouter = require('./routes/votes');
const resultsRouter = require('./routes/results');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', itemsRouter);
app.use('/api', votesRouter);
app.use('/api', resultsRouter);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
