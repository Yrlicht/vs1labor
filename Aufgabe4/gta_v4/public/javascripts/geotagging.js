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
 * Schreibt eine Tag-Liste als JSON in das data-tags-Attribut des
 * Karten-Divs (#map). Dieses Attribut dient als "Gedächtnis" im DOM:
 * Da AJAX die Seite nicht neu lädt, gibt es kein Server-seitiges
 * EJS-Rendering mehr, das taglist aktuell hält. Stattdessen pflegen
 * wir den Stand selbst hier im DOM, damit z.B. nach einem erneuten
 * applyLocation()-Aufruf die aktuellen Tags noch bekannt sind.
 *  
 */
function writeTagsToDom(taglist) {
    const mapEl = document.getElementById("map");
    if (mapEl) mapEl.dataset.tags = JSON.stringify(taglist);
}
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
 * Aktualisiert die sichtbare Ergebnisliste (<ul id="discoveryResults">)
 * anhand einer Tag-Liste. Wird nach jedem AJAX-Aufruf aufgerufen,
 * damit Liste und Karte synchron bleiben — ohne Seiten-Reload.
 * innerHTML = "" leert zunächst die gesamte Liste, danach werden
 * die neuen Einträge per forEach neu aufgebaut und angehängt.
 */
function renderResultsList(taglist) {
    const list = document.getElementById("discoveryResults");
    if (!list) return;
    list.innerHTML = "";
    taglist.forEach(tag => {
        const li = document.createElement("li");
        li.textContent = `${tag.name} ( ${tag.latitude}, ${tag.longitude}) ${tag.hashtag || ""}`;
        list.appendChild(li);
    });
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

// -----------------------------------------------------------------
// AJAX: Tagging-Formular (POST /api/geotags, JSON-Body)
// -----------------------------------------------------------------
 
/**
 * Registriert den Submit-Handler für das Tagging-Formular.
 * - Verhindert das normale (Seiten-reload) Absenden.
 * - Nutzt die eingebaute HTML5-Validierung (required, pattern, maxlength)
 *   über form.checkValidity()/reportValidity(), bevor überhaupt etwas
 *   gesendet wird. So bleibt die Validierung aus Aufgabe 1 erhalten.
 * - Sendet die Formulardaten als JSON per fetch() an POST /api/geotags.
 * - Bei Erfolg: neuen Tag in den DOM-State übernehmen und Karte+Liste
 *   aktualisieren, Formular zurücksetzen (außer lat/lon).
 */
function registerTaggingForm() {
    const form = document.getElementById("tag-form");
    if (!form) return;
 
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
 
        // HTML5-Validierung manuell auslösen, da wir das Standard-Submit
        // unterbinden (das hätte die Validierung sonst automatisch geprüft).
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
 
        const lat = document.getElementById("lat").value;
        const lon = document.getElementById("lon").value;
        const name = document.getElementById("name").value;
        const hashtag = document.getElementById("hashtag").value;
 
        // Wiederverwendung des serverseitigen GeoTag-Konstruktors (Client-Kopie
        // in public/javascripts/geotag.js), statt ein rohes Objekt zu bauen.
        const newGeoTag = new GeoTag(lat, lon, name, hashtag);
 
        try {
            const response = await fetch("/api/geotags", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newGeoTag)
            });
 
            if (!response.ok) {
                console.error("Fehler beim Anlegen des GeoTags:", response.status);
                return;
            }
 
            const createdTag = await response.json();
 
            // Lokalen State + Anzeige aktualisieren, ohne Seiten-Reload.
            const currentTags = readTagsFromDom();
            currentTags.push(createdTag);
            writeTagsToDom(currentTags);
 
            mapManager.updateMarkers(parseFloat(lat), parseFloat(lon), currentTags);
            renderResultsList(currentTags);
 
            // Eingabefelder zurücksetzen, lat/lon (readonly) bleiben erhalten.
            document.getElementById("name").value = "";
            document.getElementById("hashtag").value = "";
 
        } catch (err) {
            console.error("Netzwerkfehler beim Anlegen des GeoTags:", err);
        }
    });
}
 
// -----------------------------------------------------------------
// AJAX: Discovery-Formular (GET /api/geotags, Query-Parameter)
// -----------------------------------------------------------------
 
/**
 * Registriert den Submit-Handler für das Discovery-Formular.
 * - Verhindert das normale (Seiten-reload) Absenden.
 * - Liest Suchbegriff + aktuelle Koordinaten aus den Feldern.
 * - Baut eine GET-Anfrage mit Query-Parametern (kein Body bei GET!).
 * - Bei Erfolg: Karte + Ergebnis-Liste mit den gefundenen Tags neu
 *   befüllen.
 */
function registerDiscoveryForm() {
    const form = document.getElementById("discoveryFilterForm");
    if (!form) return;
 
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
 
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
 
        const search = document.getElementById("search").value;
        const lat = document.getElementById("discovery-lat").value;
        const lon = document.getElementById("discovery-lon").value;
 
        // URLSearchParams kümmert sich korrekt ums URL-Encoding
        // (z.B. Leerzeichen oder Sonderzeichen im Suchbegriff).
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (lat) params.set("lat", lat);
        if (lon) params.set("lon", lon);
 
        try {
            const response = await fetch(`/api/geotags?${params.toString()}`, {
                method: "GET"
            });
 
            if (!response.ok) {
                console.error("Fehler bei der Discovery-Suche:", response.status);
                return;
            }
 
            const taglist = await response.json();
 
            writeTagsToDom(taglist);
            mapManager.updateMarkers(parseFloat(lat), parseFloat(lon), taglist);
            renderResultsList(taglist);
 
        } catch (err) {
            console.error("Netzwerkfehler bei der Discovery-Suche:", err);
        }
    });
}
 
// -----------------------------------------------------------------
// Initialisierung beim Laden der Seite
// -----------------------------------------------------------------
 
document.addEventListener("DOMContentLoaded", () => {
    updateLocation();
    registerTaggingForm();
    registerDiscoveryForm();
});
