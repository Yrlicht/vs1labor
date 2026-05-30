// File origin: VS1LAB A3

const GeoTag = require('./geotag.js');

class GeoTagStore{
    // Privater GeoTag Supermarkt
    #geoTagArray = [];

    // Komm Min-Jung! Füll das Regal auf!
    addGeoTag(gt) {
        if (!(gt instanceof GeoTag)) {
            throw new Error('GeoTag Object bitttäää');
        }
        
        this.#geoTagArray.push(gt);
    }

    // Heute geh ich einkaufen
    removeGeoTag(name) {
        this.#geoTagArray = this.#geoTagArray.filter(gt => gt.name !== name);
    }

    // Inventur
    count() {
        return this.#geoTagArray.length;
    }

    // Damit kannst du GeoTags mit einem keyword (Suchbegriff) durchsuchen
    // Du kannst sogar den Suchbereich festlegen (geoTags), musst du aber nicht
    searchGeoTags(keyword, geoTags = this.#geoTagArray) {
        if(!keyword || keyword.trim() === '') {
            return [...this.#geoTagArray];
        }

        const _keyword = keyword.trim();

        return geoTags.filter(gt => {
            const nameMatch = gt.name && gt.name.toLowerCase().includes(_keyword);

            if(gt.hash !== "#n/a") {
                const hashMasch = gt.hash && gt.hash.toLowerCase().includes(_keyword);
            }
            
            return nameMatch || hashMasch;
        })
    }
    
    // helperr
    #toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    // helperr
    #calcDistBetwLocs(lat0, lon0, lat1, lon1) {
        // Erd (apfel) radius
        const r = 6371;
        const dLat = this.#toRadians(lat1 - lat0);
        const dLon = this.#toRadians(lon1 - lon0);
        const a = Math.sin(dLat / 2) *
                  Math.sin(dLat / 2) +
                  Math.cos(this.#toRadians(lat0)) *
                  Math.cos(this.#toRadians(lat1)) *
                  Math.sin(dLon / 2) *
                  Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return r * c;
    }

    // Damit bekommst du alle geoTags die in einem bestimmten radius um einen GeoTag drum herum sind.
    // Radius in km
    getNearbyGeoTags(gt0, radius = 1) {
        if(!(gt0 instanceof GeoTag)) {
            throw new Error('GeoTag Objectttttt, määäääänsch');
        }

        return this.#geoTagArray.filter(gt1 => {
            return this.#calcDistBetwLocs(gt0.lat, gt0.lon, gt1.lat, gt1.lon) <= radius;
        });
    }

    // Das ist die selbe Funktion wie die obere, nur dreht es sich hier um coordinaten
    // Praktisch, wenn das Zentrum des Gebiets kein GeoTag hat oder du kein Objekt erstellen willst.
    // Radius in km
    getNearbyGeoTagsByCoords(lat, lon, radius = 1) {
        return this.#geoTagArray.filter(gt => {
            return this.#calcDistBetwLocs(lat, lon, gt.lat, gt.lon) <= radius;
        });
    }

    // Hier ist die suche mit Suchbegriff und die Bereicheingrenzung kombiniert worden °o°
    // Hier einmal mit geoTag-Objekt als Zentrum wieder.
    // Radius in km
    searchNearbyGeoTags(gt, keyword, radius = 1) {
        if(!keyword || keyword.trim() === '') {
            return this.getNearbyGeoTags(gt, radius);
        }

        const nearbyTags = this.getNearbyGeoTags(gt, radius);
        return this.searchGeoTags(keyword, nearbyTags);
    }

    // Und mit coordinaten als Zentrum wieder.
    // Radius in km
    searchNearbyGeoTagsByCoords(lat, lon, keyword, radius = 1) {
        if(!keyword || keyword.trim() === '') {
            return this.getNearbyGeoTagsByCoords(lat, lon, radius);
        }

        const nearbyTags = this.getNearbyGeoTagsByCoords(lat, lon, radius);
        return this.searchGeoTags(keyword, nearbyTags);
    }
}

module.exports = GeoTagStore
