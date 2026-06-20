// File origin: VS1LAB A3
class InMemoryGeoTagStore{

    #geoTags = [];

  addGeoTag(geoTag) {
    this.#geoTags.push(geoTag);
  }

  removeGeoTag(name) {
    this.#geoTags = this.#geoTags.filter(
      (geoTagElem) => geoTagElem.name !== name
    );
  }

  getGeoTags() {
    return this.#geoTags;
  }
        
  getGeoTagsAsJSON() {
    return JSON.stringify(this.#geoTags);
  }


  getNearbyGeoTags(latitude, longitude, distance) {
    const nearbyTags = [];
    this.#geoTags.forEach((geoTagElem) => {
      const distBetween = calculateDistInKM(geoTagElem.latitude, geoTagElem.longitude, latitude, longitude);
      if (distBetween <= distance) {
        nearbyTags.push(geoTagElem);
      }
    });
    return nearbyTags;
  }

  searchNearbyGeoTags(latitude, longitude, keyword, distance) {
    return this.#geoTags.filter(
      (tag) =>
        (tag.name.includes(keyword) || tag.hashtag.includes(keyword)) &&
        calculateDistInKM(tag.latitude, tag.longitude, latitude, longitude) <= distance
    );
  }
}

function calculateDistInKM(lat1, long1, lat2, long2){
    const distLat = lat2 - lat1;
    const distLong = long2 - long1;

    const dist = Math.sqrt(distLat * distLat + distLong * distLong);

    const distKM = dist * 111;
    return distKM;
}

module.exports = InMemoryGeoTagStore
