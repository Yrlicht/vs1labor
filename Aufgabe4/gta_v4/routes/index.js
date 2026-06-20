// File origin: VS1LAB A3

/**
 * This script defines the main router of the GeoTag server.
 */

/**
 * Define module dependencies.
 */

const express = require('express');
const router = express.Router();

const GeoTag = require('../models/geotag');
const GeoTagStore = require('../models/geotag-store');
const GeoTagExamples = require('../models/geotag-examples');

const store = new GeoTagStore();
GeoTagExamples.getGeoTagsAsObj().forEach(tag => store.addGeoTag(tag));

// Search radius in km used for nearby queries.
const SEARCH_RADIUS_KM = 5;

router.get('/', (req, res) => {
  res.render('index', {
    taglist: store.getGeoTags(),
    latitude: '',
    longitude: ''
  });
});

/**
 * Route '/tagging' for HTTP 'POST' requests.
 *
 * Creates a new geotag from the submitted form fields and stores it.
 * Responds with the rendered template showing geotags near the new tag.
 */
router.post('/tagging', (req, res) => {
  const latitude = parseFloat(req.body.lat);
  const longitude = parseFloat(req.body.lon);
  const name = req.body.name;
  const hashtag = req.body.hashtag;

  const newTag = new GeoTag(latitude, longitude, name, hashtag);
  store.addGeoTag(newTag);

  const taglist = store.getNearbyGeoTags(latitude, longitude, SEARCH_RADIUS_KM);

  res.render('index', {
    taglist: taglist,
    latitude: latitude,
    longitude: longitude
  });
});

/**
 * Route '/discovery' for HTTP 'POST' requests.
 *
 * Reads coordinates and an optional search term from the form body.
 * Renders the template with geotags near the given location, filtered by
 * keyword when one is provided.
 */
router.post('/discovery', (req, res) => {
  const latitude = parseFloat(req.body.lat);
  const longitude = parseFloat(req.body.lon);
  const search = req.body.search;

  let taglist;
  if (search && search.trim() !== '') {
    taglist = store.searchNearbyGeoTags(latitude, longitude, search, SEARCH_RADIUS_KM);
  } else {
    taglist = store.getNearbyGeoTags(latitude, longitude, SEARCH_RADIUS_KM);
  }

  res.render('index', {
    taglist: taglist,
    latitude: latitude,
    longitude: longitude
  });
});

// API routes (A4)

/**
 * Route '/api/geotags' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the fields of the Discovery form as query.
 * (http://expressjs.com/de/4x/api.html#req.query)
 *
 * As a response, an array with Geo Tag objects is rendered as JSON.
 * If 'searchterm' is present, it will be filtered by search term.
 * If 'latitude' and 'longitude' are available, it will be further filtered based on radius.
 */

// TODO: ... your code here ...


/**
 * Route '/api/geotags' for HTTP 'POST' requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests contain a GeoTag as JSON in the body.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * The URL of the new resource is returned in the header as a response.
 * The new resource is rendered as JSON in the response.
 */

// TODO: ... your code here ...


/**
 * Route '/api/geotags/:id' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * The requested tag is rendered as JSON in the response.
 */

// TODO: ... your code here ...


/**
 * Route '/api/geotags/:id' for HTTP 'PUT' requests.
 * (http://expressjs.com/de/4x/api.html#app.put.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 * 
 * Requests contain a GeoTag as JSON in the body.
 * (http://expressjs.com/de/4x/api.html#req.query)
 *
 * Changes the tag with the corresponding ID to the sent value.
 * The updated resource is rendered as JSON in the response. 
 */

// TODO: ... your code here ...


/**
 * Route '/api/geotags/:id' for HTTP 'DELETE' requests.
 * (http://expressjs.com/de/4x/api.html#app.delete.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * Deletes the tag with the corresponding ID.
 * The deleted resource is rendered as JSON in the response.
 */

// TODO: ... your code here ...

module.exports = router;
