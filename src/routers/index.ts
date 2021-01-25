import express from 'express';
import FileRouter from './file.router';

const router = express.Router();

// test route to make sure everything is working (accessed at GET http://localhost:5000/api)
router.get('/', function (req, res) {
  res.json({ message: 'Hello! welcome to our file server api!' });
});

const file = new FileRouter();

// file, url: /api/file/list
router.use('/file', file.router);

export default router;
