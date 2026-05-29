// File origin: VS1LAB A3

/**
 * Main router of the GeoTag server.
 *
 * Prinzipien:
 * - Trennung Routing vs. Modell: Die Routen wissen, WIE Requests
 *   verarbeitet werden; das Modell (Store, GeoTag) weiß, WAS die Daten
 *   sind. Der Router orchestriert nur.
 * - Single-Store: Wir erzeugen genau eine Store-Instanz beim Laden des
 *   Moduls. Da Node Module cached, teilen sich alle Requests denselben
 *   Store -> "Persistenz" während die App läuft.
 * - Templating: Alle Routen rendern dasselbe EJS-Template `index` und
 *   übergeben je nach Kontext unterschiedliche Daten (taglist, lat, lon).
 */

const express = require('express');
const router = express.Router();

const GeoTag = require('../models/geotag');
const GeoTagStore = require('../models/geotag-store');
const GeoTagExamples = require('../models/geotag-examples');

// Eine zentrale Store-Instanz für die Lebensdauer des Servers.
const store = new GeoTagStore();
// Mit Beispieldaten füllen, damit Discovery von Anfang an etwas findet.
GeoTagExamples.populate(store);

/**
 * Route '/' – Einstiegsseite ohne Daten.
 * lat/lon = undefined: das Template setzt dann keine value-Attribute,
 * und das Client-Skript wird die GeoLocation-API anfragen.
 */
router.get('/', (req, res) => {
    res.render('index', { taglist: [], lat: undefined, lon: undefined });
});

/**
 * Route '/tagging' (POST):
 * Das Tagging-Formular schickt Felder per application/x-www-form-urlencoded.
 * Dank `express.urlencoded()` in app.js stehen sie in req.body bereit.
 * Ablauf:
 *  1. Neues GeoTag-Objekt aus den Formularfeldern bauen.
 *  2. Im Store speichern.
 *  3. Seite mit allen GeoTags in der Nähe der neuen Position rendern.
 *     -> Der Nutzer sieht direkt, was um den frisch gesetzten Tag liegt.
 *  4. lat/lon zurück ans Template, damit Discovery-/Tagging-Formular
 *     beim nächsten Aufruf nicht erneut die GeoLocation-API brauchen.
 */
router.post('/tagging', (req, res) => {
    const { lat, lon, name, hashtag } = req.body;
    const tag = new GeoTag(name, lat, lon, hashtag);
    store.addGeoTag(tag);

    const taglist = store.getNearbyGeoTags(parseFloat(lat), parseFloat(lon));
    res.render('index', { taglist, lat, lon });
});

/**
 * Route '/discovery' (POST):
 * Das Discovery-Formular liefert Koordinaten + optionalen Suchbegriff.
 * searchNearbyGeoTags() filtert nach Radius UND Keyword.
 * Bei leerem Suchbegriff -> alle Tags im Umkreis.
 */
router.post('/discovery', (req, res) => {
    const { lat, lon, search } = req.body;
    const taglist = store.searchNearbyGeoTags(parseFloat(lat), parseFloat(lon), search);
    res.render('index', { taglist, lat, lon });
});

module.exports = router;
