// File origin: VS1LAB A3

/* eslint-disable no-unused-vars */

// Dieses Skript läuft, sobald die EJS-gerenderte Seite im Browser ist.
//
// Prinzipien:
// - Single Responsibility: LocationHelper und MapManager leben jetzt in
//   eigenen Dateien (location-helper.js, map-manager.js). Dieses Skript
//   kümmert sich nur um die Verdrahtung "DOM <-> Helper".
// - Latenz vermeiden: navigator.geolocation kann mehrere Sekunden brauchen
//   und triggert eine Browser-Berechtigungsabfrage. Beim 2./3. Seitenaufruf
//   stehen die Koordinaten schon im Formular (vom Server vorbefüllt), also
//   sparen wir uns den API-Call dann.
// - Daten aus dem DOM: Der Server hat die aktuelle Trefferliste als
//   JSON-String im data-tags-Attribut abgelegt. Wir parsen ihn und geben
//   das Array an MapManager.updateMarkers weiter -> Marker für alle Hits.

console.log("The geoTagging script is going to start...");

// MapManager außerhalb von updateLocation, sonst würde Leaflet bei
// erneutem L.map('map') auf demselben Container crashen.
const mapManager = new MapManager();

/**
 * Liest die GeoTag-Liste aus dem data-tags-Attribut des #map-Divs.
 * Fallback auf [], falls Attribut fehlt oder leer ist.
 */
function readTagsFromDom() {
    const mapEl = document.getElementById("map");
    const raw = mapEl ? mapEl.dataset.tags : "";
    if (!raw) return [];
    try {
        return JSON.parse(raw);
    } catch (e) {
        console.warn("data-tags konnte nicht geparst werden:", e);
        return [];
    }
}

/**
 * Initialisiert Karte + Formularfelder mit gegebenen Koordinaten.
 * Wird einmal mit den finalen Koords aufgerufen – egal ob die aus
 * dem Formular oder aus der GeoLocation-API kommen.
 */
function applyLocation(latitude, longitude) {
    document.getElementById("lat").value = latitude;
    document.getElementById("lon").value = longitude;
    document.getElementById("discovery-lat").value = latitude;
    document.getElementById("discovery-lon").value = longitude;

    mapManager.initMap(latitude, longitude);
    // tags aus dem DOM -> für jedes ein Marker auf der Karte
    mapManager.updateMarkers(latitude, longitude, readTagsFromDom());

    // Platzhalter-Bild + Label entfernen, sobald die echte Karte da ist.
    const img = document.getElementById("mapView");
    const label = document.querySelector("#map span");
    if (img) img.remove();
    if (label) label.remove();
}

/**
 * Entscheidet, woher die aktuellen Koordinaten kommen:
 *  - Stehen Werte im Formular (vom Server vorbefüllt) -> direkt nehmen.
 *  - Sonst: GeoLocation-API anfragen (kostet Zeit + Permission-Prompt).
 */
function updateLocation() {
    const latField = document.getElementById("lat");
    const lonField = document.getElementById("lon");

    if (latField.value && lonField.value) {
        // Fall: 2.+ Request – Server hat lat/lon im Template gesetzt.
        applyLocation(latField.value, lonField.value);
    } else {
        // Fall: 1. Request – noch keine Koordinaten bekannt.
        LocationHelper.findLocation((helper) => {
            applyLocation(helper.latitude, helper.longitude);
        });
    }
}

document.addEventListener("DOMContentLoaded", updateLocation);
