// File origin: VS1LAB A3

/**
 * Define module dependencies.
 */

const GeoTagStore = require('./models/geotag-store');
const GeoTagExamples = require('./models/geotag-examples');

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');

/**
 * Set up Express app.
 */

const app = express();

// Set ejs as the view engine.
app.set('views', path.join(__dirname, 'views'));

// Set ejs template folder.
app.set('view engine', 'ejs');

// Set logger
app.use(logger('dev'));

// Set content processing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/**
 * VS1LAB:
 * Configure path for static content.
 * Test the result in a browser here: 'http://localhost:3000/'.
 */
// Store auffüllen
const store = new GeoTagStore();
const exTags = GeoTagExamples.getGeoTagsAsObj();
exTags.forEach(gt => store.addGeoTag(gt));
console.log(`Store populated with ${store.count()} geotags`);
// Statisch daten
app.use(express.static(path.join(__dirname, 'public')));
// Übergeben an Router
const indexRouter = require('./routes/index')(store);

// Set dedicated script for routing
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
  });

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};  
    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });

 module.exports = app;
