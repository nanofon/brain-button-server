import express from 'express';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

var router = new express.Router();

/* GET home page. */
/*
router.get('/sandbox/', (req, res) => {
  res.render('index', {
      header: 'Sandbox to practice web-development',
      message: 'Sandbox page',
      paragraph: 'Mmm... So sandy...'
  });
});

router.get('/soup/', (req, res) => {
  res.render('soup')
})
*/

router.get('/', (req, res) => {
  res.sendFile(__dirname + '/static/index.html')
})

export default router;
