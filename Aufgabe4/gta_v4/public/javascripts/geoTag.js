class GeoTag {

    constructor(latitude, longitude, name, hashtag) {
        this.name = name;
        // parseFloat: Formulardaten kommen als String an, wir wollen Zahlen.
        this.latitude = parseFloat(latitude);
        this.longitude = parseFloat(longitude);
        this.hashtag = hashtag;
    }

}

module.exports = GeoTag;
