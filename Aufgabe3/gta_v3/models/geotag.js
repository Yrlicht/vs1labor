// File origin: VS1LAB A3
// höhöhööö
// Ah ja GeoTag Klasse

class GeoTag {
    constructor(lat, lon, name, hash = "#n/a") {
        this._lat = lat;
        this._lon = lon;
        this._name = name;

        if(hash.trim() === '')
            hash = "#n/a";
        else
            this._hash = hash;
    }

    get lat() {
        return this._lat;
    }
    
    get lon() {
        return this._lon;
    }
    
    get name() {
        return this._name;
    }
    
    get hash() {
        return this._hash;
    }
}

module.exports = GeoTag;
