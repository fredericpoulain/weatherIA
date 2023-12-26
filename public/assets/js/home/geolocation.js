import {displayMessage} from "./uxHome.js";
import {elLoading} from "./search.js";
import {setLocalStorage} from "../localStorage.js";
import {LOCALSTORAGE_ACTIVECITY_KEY} from "../constants.js";
import {updateDOM} from "./DOM.js";
import {callTheServer, getWeather} from "../serverRequest.js";

export function locateMe() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getPosition, showError);
    } else {
        displayMessage('La géolocalisation n\'est pas disponible avec votre navigateur.');
    }
}

async function getPosition(position) {
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;
    try {
        elLoading.classList.add('activeLoading');
        const res = await callTheServer('localTime', latitude, longitude);
        console.log(res)
        const {cityName, stateName, countryName, timezoneName, timestampCity} = res;
        const resultWeather = await getWeather(latitude, longitude, timezoneName);
        console.log(resultWeather)
        const activeCity = {cityName, countryName, stateName, latitude, longitude, timezoneName}
        setLocalStorage(LOCALSTORAGE_ACTIVECITY_KEY, activeCity);
        updateDOM(activeCity, timestampCity, resultWeather);
        //Notation abrégée ES6 :
        /**
         * Syntaxe moins concise :
         * {
         *  cityName: cityName,
         *  latitude: latitude,
         *  longitude: longitude,
         *  timezoneName: timezoneName
         *  };
         *
         */
        // const ObjectDataCity = {cityName, latitude, longitude, timezoneName};

    } catch (error) {
        displayMessage('Erreur survenue.');
    } finally {
        elLoading.classList.remove('activeLoading');
    }

}

// Définir une fonction pour gérer les erreurs de géolocalisation
function showError(error) {
    let message = '';
    switch (error.code) {
        case error.PERMISSION_DENIED:
            message = "Vous avez refusé l'accès à votre position.";
            break;
        case error.POSITION_UNAVAILABLE:
            message = "Votre position n'a pas pu être déterminée.";
            break;
        case error.TIMEOUT:
            message = "Le délai d'attente a été dépassé.";
            break;
        case error.UNKNOWN_ERROR:
            message = "Une erreur inconnue s'est produite.";
            break;
    }
    displayMessage(message, 5000)

}

