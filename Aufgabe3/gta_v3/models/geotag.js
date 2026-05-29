// File origin: VS1LAB A3

/**
 * A class representing geotags.
 *
 * Prinzip: Die Klasse spiegelt 1:1 die Felder des Tagging-Formulars.
 * So können wir aus den Formulardaten (req.body) direkt ein GeoTag-Objekt
 * erzeugen und im Store ablegen. Mehr Logik braucht das Modell nicht –
 * es ist ein reiner Datencontainer ("Plain Old JS Object" als Klasse).
 */
class GeoTag {

    constructor(name, latitude, longitude, hashtag) {
        this.name = name;
        // parseFloat: Formulardaten kommen als String an, wir wollen Zahlen.
        this.latitude = parseFloat(latitude);
        this.longitude = parseFloat(longitude);
        this.hashtag = hashtag;
    }

}

module.exports = GeoTag;
