import { getLocalStorage, } from '../localStorage.js';
import { LOCALSTORAGE_ACTIVECITY_KEY } from '../constants.js';
import { deleteForm, displayMessage, preventEnterKey, profileMenu, elSearchInput } from './uxHome.js';
import { debounce, search, elLoading } from './search.js';
import { updateDOM, elWeatherContent } from './DOM.js';
import { locateMe } from './geolocation.js';
import {callTheServer, getWeather} from "../serverRequest.js";

const elDeleteIcon = document.querySelector('.deleteIcon');
const elTemplateMessage = document.querySelector('.templateMessage');
const elLocateMe = document.querySelector('.locateMe');
const debouncedSearch = debounce(() => search(), 450);


elSearchInput.addEventListener("input", debouncedSearch);
elDeleteIcon.addEventListener("click", deleteForm);
elLocateMe.addEventListener("click", locateMe);
window.addEventListener("load", loadDataWeather);
window.addEventListener("load", profileMenu);
elSearchInput.addEventListener('keydown', preventEnterKey);
async function loadDataWeather() {
    //On récupère la ville active du localStorage
    const activeCity = getLocalStorage(LOCALSTORAGE_ACTIVECITY_KEY);
    //s'il y a des données, on charge la météo
    if (activeCity) {
        try {
            // const cityName = activeCity.cityName;
            elLoading.classList.add('activeLoading');
            const {latitude, longitude} = activeCity
            // Utilisation de Promise.all pour effectuer les appels asynchrones en parallèle
            const [resultWeather, resultLocalTime] = await Promise.all([
                getWeather(latitude, longitude, activeCity.timezoneName),
                callTheServer('localTime', latitude, longitude)
            ]);
            const timestampCity = resultLocalTime.timestampCity;
            updateDOM(activeCity, timestampCity, resultWeather);
        } catch (error) {
            // displayMessage('Erreur survenue...');
            displayMessage(error.message);
        } finally {
            elLoading.classList.remove('activeLoading');
        }
    } else {
        //si pas de données LOCALSTORAGE_ACTIVECITY_KEY dans le localStorage, on affiche le message
        const elCloneElements = elTemplateMessage.content.cloneNode(true);
        elWeatherContent.append(elCloneElements);
    }
}




