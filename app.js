const express = require('express')
const app = express()
const port = 3000
const {sequelize } = require("./db")

// Test the database connection
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });


// Sync the models with the database
sequelize.sync() // Use { force: true } only during development to drop and re-create tables
  .then(() => {
    console.log('Database synchronized');
  })
  .catch(err => {
    console.error('Unable to synchronize the database:', err);
  });

app.use(express.json())

app.post('/identify', (req, res, next) => {
    // payload validation
    const { email, phoneNumber } = req.body;
    if(!email && !phoneNumber){
        return res.status(422).json({ error: 'Invalid Payload' });
    }
    if(typeof email != "string")return res.status(422).json({ error: 'Invalid Payload Format' });
    if(typeof phoneNumber != "string")return res.status(422).json({ error: 'Invalid Payload Format' });
    
    next()
},require("./controller"))

app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})