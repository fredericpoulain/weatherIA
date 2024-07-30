import {displayMessage, elSearchInput, elSearchList, elSearchListUL, hideList} from "./uxHome.js";
import { updateDOM} from './DOM.js';
import {setLocalStorage} from "../localStorage.js";
import {callTheServer, getWeather} from "../serverRequest.js";
import {LOCALSTORAGE_ACTIVECITY_KEY} from "../constants.js";

const elTemplateLi = document.querySelector('.templateLi');
export const elLoading = document.querySelector('.loading');

export function debounce(func, delay) {
    // créer une variable pour stocker l'identifiant du délai
    let timer;
    // retourner une fonction qui prend les mêmes arguments que la fonction originale
    return (...args) => {
        // annuler le délai précédent s'il existe
        clearTimeout(timer);
        // créer un nouveau délai qui appelle la fonction originale après le temps spécifié
        timer = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}


export async function search(e) {
    let valueSearch = elSearchInput.value;
    try {
        //minimum 3 caractères
        if (valueSearch.length >= 3) {
            //on réinitialise le contenu de la liste
            elSearchListUL.innerHTML = "";
            //On fait appel à l'API here Autocompletion
            // const result = await callAutocompleteAPI(valueSearch);

            const result = await callTheServer('autocompletion', valueSearch);


            if (result.suggestions.length === 0) {
                hideList();
            }

            //On boucle sur le résultat
            result.suggestions.forEach((res) => {
                //On suggère uniquement les noms de ville
                if (res.matchLevel === 'city') {
                    //On construit la liste dans le DOM
                    createAutocompletedList(res)
                }
            });
        } else {
            //si moins de 3 caractères, on masque la liste
            hideList();
        }
    } catch (error) {
        displayMessage('Erreur survenue');
    }
}


function createAutocompletedList({locationId, address: {country, city, state}}) {

    // const {locationId, address:{country, city, state} } = res;
    const fragmentDoc = elTemplateLi.content.cloneNode(true);
    const select = el => fragmentDoc.querySelector(el);
    const [elCitySpan, elStateCountrySpan, elLi] = ['.citySpan', '.stateCountrySpan', 'li'].map(select);
    // même chose que :
    // const elCitySpan = fragmentDoc.querySelector('.citySpan');
    // const elStateCountrySpan = fragmentDoc.querySelector('.stateCountrySpan');
    // const elLi = fragmentDoc.querySelector('li');

    elLi.setAttribute("data-locationID", locationId);
    elCitySpan.textContent = city;
    elStateCountrySpan.textContent = state ? `${state}/${country}` : `${country}`;
    elLi.addEventListener('click', selectionCity);
    elSearchListUL.append(fragmentDoc);
    elSearchList.classList.add("showList");
}

async function selectionCity(e) {
    try {
        elLoading.classList.add('activeLoading');
        // const cityName = this.querySelector('.citySpan').textContent;
        const locationID = this.getAttribute('data-locationID');
        //fetch pour récupérer les latitudes et longitude
        const infosCity = await callTheServer('getinfoscity', locationID);
        //Au clic de la ville, ont créé un nouvel objet qui contiendra les données (lat et long)

        const {cityName, countryName, stateName, latitude, longitude, timezoneName, timestampCity} = infosCity

        const resultWeather = await getWeather(latitude, longitude, timezoneName);

        //updateDOM : ajoute les éléments au DOM, affiche les boutons IA et Favoris
        const activeCity = {cityName, countryName, stateName, latitude, longitude, timezoneName};
        setLocalStorage(LOCALSTORAGE_ACTIVECITY_KEY, activeCity);

        updateDOM(activeCity, timestampCity, resultWeather);
        elSearchInput.value = "";
        hideList();
        //Notation abrégée ES6 :
        /**
         * Syntaxe non concise :
         * {
         *  cityName: cityName,
         *  latitude: latitude,
         *  longitude: longitude,
         *  timezoneName: timezoneName
         *  };
         *
         */
        //const ObjectDataCity = {cityName, latitude, longitude, timezoneName};



    } catch (error) {
        displayMessage('Erreur survenue !');
    } finally {
        elLoading.classList.remove('activeLoading');
    }
}