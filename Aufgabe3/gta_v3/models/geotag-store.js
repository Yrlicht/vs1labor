// File origin: VS1LAB A3

/**
 * A class for in-memory-storage of geotags.
 *
 * Prinzipien:
 * - Kapselung: Der Array `#geotags` ist `private` (#-Prefix), damit
 *   Code von außen ihn nicht direkt mutieren kann. Zugriff nur über
 *   die definierten Methoden -> klare API, weniger Fehlerquellen.
 * - "In-Memory": Die Daten leben nur im Prozess-RAM. Beim Neustart
 *   sind sie weg. Eine echte App würde hier eine DB anbinden.
 * - Proximitätssuche: Wir nehmen vereinfachend die euklidische Distanz
 *   in Grad. Für kleine Radien (Campus) reicht das; für korrekte
 *   geographische Distanzen müsste man Haversine nehmen.
 */
class InMemoryGeoTagStore {

    #geotags = [];

    // Default-Radius in "Grad" – grob ~1 km. Reicht für das Lab.
    #defaultRadius = 0.01;

    addGeoTag(geotag) {
        this.#geotags.push(geotag);
    }

    /**
     * Gibt eine Kopie aller gespeicherten GeoTags zurück.
     * Kopie (slice) statt Referenz: außenstehender Code kann die Liste
     * nicht hinter unserem Rücken verändern (Kapselung bleibt erhalten).
     */
    getAllGeoTags() {
        return this.#geotags.slice();
    }

    /**
     * Entfernt alle GeoTags mit passendem Namen.
     * filter() erzeugt einen neuen Array ohne die Treffer.
     */
    removeGeoTag(name) {
        this.#geotags = this.#geotags.filter(tag => tag.name !== name);
    }

    /**
     * Liefert alle GeoTags innerhalb eines Radius um (lat, lon).
     * Pythagoras auf Lat/Lon-Differenzen nur für kleine Distanzen ok.
     */
    getNearbyGeoTags(latitude, longitude, radius = this.#defaultRadius) {
        return this.#geotags.filter(tag => {
            const dLat = tag.latitude - latitude;
            const dLon = tag.longitude - longitude;
            return Math.sqrt(dLat * dLat + dLon * dLon) <= radius;
        });
    }

    /**
     * Wie getNearbyGeoTags, aber zusätzlich nach Keyword gefiltert.
     * - Teilstring-Match in name ODER hashtag.
     * - Case-insensitive (toLowerCase auf beiden Seiten).
     * - Leeres/undefiniertes Keyword -> alle Nahen werden zurückgegeben.
     */
    searchNearbyGeoTags(latitude, longitude, keyword, radius = this.#defaultRadius) {
        const nearby = this.getNearbyGeoTags(latitude, longitude, radius);
        if (!keyword) return nearby;
        const k = keyword.toLowerCase();
        return nearby.filter(tag =>
            tag.name.toLowerCase().includes(k) ||
            (tag.hashtag && tag.hashtag.toLowerCase().includes(k))
        );
    }

}

module.exports = InMemoryGeoTagStore;
