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

/**
 * Single in-memory store, seeded with example geotags.
 */
const store = new GeoTagStore();
GeoTagExamples.getGeoTagsAsObj().forEach(tag => store.addGeoTag(tag));

// Search radius in km used for nearby queries.
const SEARCH_RADIUS_KM = 5;

/**
 * Route '/' for HTTP 'GET' requests.
 * Renders the entry page without any geotag results.
 */
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

module.exports = router;
