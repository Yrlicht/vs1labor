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

    //Wir brauchen einen eindeutigen Primärschlüssel (siehe Aufgabe 4). 
    //Ids werden nicht mehrmals verwendet. Auch bei Löschen! Eindeutigkeit gegeben. 
    #nextId = 1; 

    /**
     * Erstellen eines neuen Geotags mit eindeutiger ID
     * ID wird auf das Objekt aufgesetzt (Mutation)
     *  
     * 
     */
    addGeoTag(geotag) {
        geotag.id = this.#nextId++; 
        this.#geotags.push(geotag);
        return geotag; 
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
     * Liefert den einen Geotag mit der id oder undefined, falls nichts gefunden wurde
    */
    getGeoTagById(id) {
        return this.#geotags.find(tag => tag.id === id);
    }
    /**
     * Funktion zum Aendern eines bestehen Geotags mit neuen Werten 
     * updatedFields uebernimmt alles was uebergeben wurde (lat, lon, name, hashtag)
     * muss aber nicht alles
     */
    updateGeoTag(id, updatedFields) {
        const tag = this.getGeoTagById(id); 
        if (!tag) return undefined; 

        if (updatedFields.name !== undefined) tag.name = updatedFields.name;
        if (updatedFields.latitude !== undefined) tag.latitude = parseFloat(updatedFields.latitude);
        if (updatedFields.longitude !== undefined) tag.longitude = parseFloat(updatedFields.longitude);
        if (updatedFields.hashtag !== undefined) tag.hashtag = updatedFields.hashtag;

        return tag;
    }

    /**
     * Entfernt alle GeoTags mit passendem Namen.
     * filter() erzeugt einen neuen Array ohne die Treffer.
     */
    removeGeoTag(name) {
        this.#geotags = this.#geotags.filter(tag => tag.name !== name);
    }
    /**
     * Entfernt Den Tag mit der ID und gibt das gelöschte Objekt wieder zurück
     * oder undefined
     * 
     */
    removeGeoTagById(id) {
        const tag = this.getGeoTagById(id);
        if (!tag) return undefined;
        this.#geotags = this.#geotags.filter(t => t.id !== id);
        return tag; 
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
    /**
     * Funktion zur Suche ueber alle Tags, fuer GET /api/geotags
     * keyword: teilstring-Match in name/hashtag
     * wir filtern zudem auch in Naehe wenn Lat und lon angegeben wurde 
     * wird nicht angegeben, werden alle Tags zurueck gegeben
     *  
     */
    searchGeoTags({ keyword, latitude, longitude, radius = this.#defaultRadius } = {}) {
        let result = this.#geotags.slice(); 

        if (latitude !== undefined && longitude !== undefined &&
            !isNaN(latitude) && !isNaN(longitude)) {
                result = result.filter(tag => {
                    const dLat = tag.latitude - latitude;
                    const dLon = tag.longitude - longitude;
                    return Math.sqrt(dLat * dLat * dLon * dLon) <= radius; 
                });
            }
            if (keyword) {
                const k = keyword.toLowerCase();
                result = result.filter(tag =>
                    tag.name.toLowerCase().includes(k) ||
                    (tag.hashtag && tag.hashtag.toLowerCase().includes(k))
                );
            }
            return result;
        }
        /**
        * Anzahl gespeicherter GeoTags – praktisch fürs Debug-Logging.
        */
    count() {
        return this.#geotags.length;
    }

}

module.exports = InMemoryGeoTagStore;
