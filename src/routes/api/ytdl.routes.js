const express = require('express');
const { check, param } = require('express-validator');

const router = express.Router();

const YtdlController = require('./../../controllers/api/ytdl.controller');

router.post('/', [check('url').not().isEmpty().withMessage('url is required')], YtdlController.store);
router.post('/info', [check('url').not().isEmpty().withMessage('url is required')], YtdlController.index);

module.exports = router;
