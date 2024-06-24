const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const transactionsRouter = require('./routes/transactions/transactions.router');

const app = express();

app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

app.use('/transactions', transactionsRouter);



const dummyData = {
    message: "Hello from the backend!",
    data: [1, 2, 3, 4, 5]
  };

app.get('/data', (req, res) => {
    const htmlResponse = `
    <html>
      <head>
        <title>Dummy Data</title>
      </head>
      <body>
        <h1>${dummyData.message}</h1>
        <ul>
          ${dummyData.data.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </body>
    </html>
  `;
    res.send(htmlResponse);
})
module.exports = app;