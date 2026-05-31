// File origin: VS1LAB A2/A3

/* eslint-disable no-unused-vars */

// This script is executed when the browser loads index.html.
// The LocationHelper and MapManager classes have been moved to
// ./location-helper.js and ./map-manager.js respectively.

console.log("The geoTagging script is going to start...");

// Single MapManager instance reused across re-renders so Leaflet
// does not crash when initMap is called multiple times.
const mapManager = new MapManager();

/**
 * Read the taglist that the server attached to the #map element
 * as a JSON string in its data-tags attribute and return it as an array.
 */
function readTagsFromMap() {
    const mapEl = document.getElementById("map");
    if (!mapEl) return [];
    const raw = mapEl.dataset.tags;
    if (!raw) return [];
    try {
        return JSON.parse(raw);
    } catch (e) {
        console.error("Failed to parse data-tags:", e);
        return [];
    }
}

/**
 * Initialize the map and draw markers for the given location and tags.
 */
function renderMap(latitude, longitude, tags) {
    mapManager.initMap(latitude, longitude);
    mapManager.updateMarkers(latitude, longitude, tags);

    // Remove the placeholder image/label inserted in the static markup,
    // guarding against repeated calls.
    const img = document.getElementById("mapView");
    const label = document.querySelector("#map span");
    if (img) img.remove();
    if (label) label.remove();
}

/**
 * Write coordinates into all tagging/discovery form fields.
 */
function writeCoordsToForms(latitude, longitude) {
    document.getElementById("lat").value = latitude;
    document.getElementById("lon").value = longitude;
    document.getElementById("discovery-lat").value = latitude;
    document.getElementById("discovery-lon").value = longitude;
}

/**
 * Retrieve the current location and update the page.
 * If the server already filled coordinates into the form, reuse those
 * instead of calling the GeoLocation API again.
 */
function updateLocation() {
    const tags = readTagsFromMap();

    const latField = document.getElementById("lat").value;
    const lonField = document.getElementById("lon").value;

    if (latField !== "" && lonField !== "") {
        // Coordinates were supplied by the server - reuse them.
        renderMap(parseFloat(latField), parseFloat(lonField), tags);
        return;
    }

    // First page load: fetch coordinates from the GeoLocation API.
    LocationHelper.findLocation((helper) => {
        writeCoordsToForms(helper.latitude, helper.longitude);
        renderMap(helper.latitude, helper.longitude, tags);
    });
}

// Wait for the page to fully load its DOM content, then call updateLocation.
document.addEventListener("DOMContentLoaded", updateLocation);