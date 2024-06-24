const express = require('express');
const {httpAddnewTransaction} = require('./transactions.controller');

const transactionsRouter = express.Router();

transactionsRouter.post('/', httpAddnewTransaction);



// Dummy data to be sent to the frontend
// const dummyData = {
//     message: "Hello from the backend!",
//     data: [1, 2, 3, 4, 5]
//   };
  
// transactionsRouter.get('/', (req, res) => {
//     res.json(dummyData);
// });


module.exports = transactionsRouter;