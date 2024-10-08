require('dotenv').config();

const PORT = process.env.PORT || 8000;
const APP_URL = `${process.env.APP_URL || 'http://localhost'}:${PORT}`;
const IS_DEV = process.env.NODE_ENV === 'development';


module.exports = { PORT, APP_URL, IS_DEV };