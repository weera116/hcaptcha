const keys = require('./.private/keys');

const express = require('express');
const cors = require('cors');

const { verify } = require('hcaptcha');


const app = express();
app.use(cors());
app.use(express.json());


app.get('/siteverify/:token', (req, res) => {
  try {
    const result = verify(keys.HCAPTCHA_SECRET, req.body.token);
    if (!result.success) {
      const error = new Error('Verification Failed.');
      error.statusCode = 422;
      throw error;
    }
    res.status(200).json({
      message: 'Success',
      attendances
    });
  } catch (error) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
});

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  if (status == 500) console.log(error);
  const message = error.message;
  const data = error.data;
  res.status(status).json({
    message: message,
    data: data
  });
});

app.listen(5000, err => {
  console.log('Listening');
});