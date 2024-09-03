const express = require('express');
const router = express.Router();

router.use('/api/v1/ytdl', require('./api/ytdl.routes.js'));
router.use('/api/v1/tiktok', require('./api/tiktok.routes.js'));

module.exports = router;
