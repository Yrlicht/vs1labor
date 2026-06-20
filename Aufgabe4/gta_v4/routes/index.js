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
    // Beim Erstaufruf hat der Server noch keine Client-Position.
    // Damit die Karte trotzdem nicht leer ist, schicken wir einfach
    // alle bekannten GeoTags als Startliste mit.
    res.render('index', { taglist: store.getAllGeoTags(), lat: undefined, lon: undefined });
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
    const tag = new GeoTag(lat, lon, name, hashtag);
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
    console.log('Discovery request:', {lat, lon, search});
    const taglist = store.searchNearbyGeoTags(parseFloat(lat), parseFloat(lon), search);
    console.log('Gefundene Tags:', taglist.length);
    res.render('index', { taglist, lat, lon });
});




/**
 * Route '/api/geotags/:id' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * The requested tag is rendered as JSON in the response.
 * Filtert nach Suchbegriff (?search...) und nach Naehe (?lat ... und ?lon...) 
 */


router.get('/api/geotags', (req, res) => {
    const { search, lat, lon } = req.query;
    const taglist = store.searchGeoTags({
        keyword: search, 
        latitude: lat !== undefined ? parseFloat(lat) : undefined,
        longitude: lon !== undefined ? parseFloat(lon) : undefined
    });
    res.json (taglist);
});

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

router.post('/api/geotags', (req, res) => {
    const { latitude, longitude, name, hashtag } = req.body;

    //Name und Koordinatien sind erforderlich (Validierung)
    if (!name || latitude === undefined || longitude === undefined) {
        return res.status(400).json({ error: `name, latitude und longitude sind erforderlich.` });
    }
    const tag = new GeoTag(latitude, longitude, name, hashtag);
    store.addGeoTag(tag); //setzt tag.id

    res.location(`/api/geotags/${tag.id}`);
    res.status(201).json(tag);
});

    /**
     * zuzaetliche Get Methode zur Lieferung eines Einzelnen GeoTags per Id.
     * 404 falls kein Tag mit der Id existiert
     */
router.get('/api/geotags/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const tag = store.getGeoTagById(id);

    if (!tag) {
        return res.status(404).json({ error: `Geotag: ${req.params.id} nicht gefunden. `});
    }

    res.json(tag);
});




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
 * 404 falls Id nicht existiert 
 */

router.put('/api/geotags/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const updated = store.updateGeoTag(id, req.body);

    if (!updated) {
        return res.status(404).json({ error: `Geotag ${req.params.id} wurde nicht gefunden`});
    }
    res.json(updated);
})


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

router.delete('/api/geotags/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const deleted = store.removeGeoTagById(id);

    if (!deleted) {
        return res.status(404).json({ error: `Geotag ${req.params.id} nicht gefunden`})
    }
    res.json(deleted);
});

module.exports = router;
