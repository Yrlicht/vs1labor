// File origin: VS1LAB A3

/**
 * This script is a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

const GeoTag = require('./geotag');

/**
 * A class representing example geoTags at HKA.
 *
 * Prinzip: tagList liefert nur Rohdaten (Arrays). populate() wandelt
 * sie in GeoTag-Objekte um und schreibt sie in einen übergebenen Store.
 * Dadurch bleibt die Klasse von der konkreten Store-Implementierung
 * entkoppelt – wir reichen einfach irgendwas rein, das `addGeoTag` kann
 * (Dependency Injection in klein).
 */
class GeoTagExamples {

    /**
     * Befüllt den übergebenen Store mit den Beispiel-GeoTags.
     * @param {{addGeoTag: function}} store
     */
    static populate(store) {
        for (const [name, lat, lon, hashtag] of GeoTagExamples.tagList) {
            store.addGeoTag(new GeoTag(name, lat, lon, hashtag));
        }
    }

    /**
     * Provides some geoTag data
     */
    static get tagList() {
        return [
            ['Castle', 49.013790, 8.404435, '#sight'],
            ['IWI', 49.013790, 8.390071, '#edu'],
            ['Building E', 49.014993, 8.390049, '#campus'],
            ['Building F', 49.015608, 8.390112, '#campus'],
            ['Building M', 49.016171, 8.390155, '#campus'],
            ['Building LI', 49.015636, 8.389318, '#campus'],
            ['Auditorium He', 49.014915, 8.389264, '#campus'],
            ['Building R', 49.014992, 8.392365, '#campus'],
            ['Building A', 49.015738, 8.391619, '#campus'],
            ['Building B', 49.016843, 8.391372, '#campus'],
            ['Building K', 49.013190, 8.392090, '#campus'],
        ];
    }
}

module.exports = GeoTagExamples;
