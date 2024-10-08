const express = require('express');
const path = require('path');
const createError = require('http-errors');
const cors = require('cors');

const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./src/routes/index.js');

const { APP_URL, PORT, IS_DEV } = require('./src/config/constants.config.js');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.set('json spaces', 2);

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function (_, _, next) {
    next(createError(404));
});

// error handler
app.use(function (err, _, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = IS_DEV ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.json({ message: err.message });
});

app.listen(PORT, () => {
    console.log(`🔥 Server listening on ${APP_URL}`);
});

module.exports = app;
