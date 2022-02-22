import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

var router = new express.Router();

router.get('/', (req, res) => {
  res.sendFile(__dirname + '/static/index.html')
})

export default router;
