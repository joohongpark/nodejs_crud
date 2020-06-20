var express = require('express');
var router = express.Router();

/* GET Main Page */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express CRUD Test Main Page' });
});

module.exports = router;
