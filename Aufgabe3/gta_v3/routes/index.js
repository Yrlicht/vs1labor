const express = require('express');
const GeoTag = require('../models/geotag');

// Der Router wird jetzt als Funktion exportiert, die den Store annimmt
module.exports = (store) => {
  const router = express.Router();

  // GET / (wie gehabt, zeigt leere Liste – könnte aber auch alle anzeigen)
  router.get('/', (req, res) => {
    res.render('index', { taglist: [] });
  });

  // POST /tagging
  router.post('/tagging', (req, res) => {
    try {
      const { lat, lon, name, hashtag } = req.body;
      // Validierung: Koordinaten müssen gültige Zahlen sein
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);
      if (isNaN(latitude) || isNaN(longitude) || !name) {
        throw new Error('Invalid input');
      }
      // Neues GeoTag erstellen (hash = hashtag oder leer)
      const newTag = new GeoTag(latitude, longitude, name, hashtag || '#n/a');
      store.addGeoTag(newTag);

      // Ergebnisse in der Nähe des neuen Tags (Standardradius 1 km)
      const nearby = store.getNearbyGeoTags(newTag, 1);
      // Für das Template umwandeln (latitude/longitude/hashtag)
      const taglist = nearby.map(gt => ({
        name: gt.name,
        latitude: gt.lat,
        longitude: gt.lon,
        hashtag: gt.hash
      }));
      res.render('index', { taglist });
    } catch (err) {
      console.error(err);
      res.status(400).render('index', { taglist: [] });
    }
  });

  // POST /discovery
  router.post('/discovery', (req, res) => {
    try {
      const { lat, lon, search } = req.body;
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);
      if (isNaN(latitude) || isNaN(longitude)) {
        throw new Error('Invalid coordinates');
      }
      const keyword = (search && search.trim()) ? search.trim() : null;
      let results;
      if (keyword) {
        // Mit Suchbegriff filtern (Radius 1 km)
        results = store.searchNearbyGeoTagsByCoords(latitude, longitude, keyword, 1);
      } else {
        // Kein Suchbegriff: alle Tags im Radius
        results = store.getNearbyGeoTagsByCoords(latitude, longitude, 1);
      }
      const taglist = results.map(gt => ({
        name: gt.name,
        latitude: gt.lat,
        longitude: gt.lon,
        hashtag: gt.hash
      }));
      res.render('index', { taglist });
    } catch (err) {
      console.error(err);
      res.status(400).render('index', { taglist: [] });
    }
  });

  return router;
};