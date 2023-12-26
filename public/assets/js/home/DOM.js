import {getCompleteDate, getDayFromISO8601, getHourFromISO8601, getWeatherIcon,} from "../utilities.js";
import {getLocalStorage, setLocalStorage} from '../localStorage.js';
import {displayMessage, displayScrollIcon} from "./uxHome.js";
import {LOCALSTORAGE_ACTIVECITY_KEY} from "../constants.js";
import {callTheServer} from "../serverRequest.js";

const elTemplateWeather = document.querySelector('.templateWeather');
export const elWeatherContent = document.querySelector('.weatherContent');


let elAddFavoritesButton = '';
let action = '';
const orangeColor = "#FF9E0EFF";

export function updateDOM(activeCity, timestampCity, {hourly, daily, current_weather}) {
    /**
     * RELEVÉ DES DONNÉES
     * Les préfixes des heures serviront à déterminer quel type d'icône il faudra afficher (jour ou nuit) :
     */
    const completeDate = `${getCompleteDate(timestampCity)}, ${getHourFromISO8601(timestampCity)}`;
    const hourPrefix = Number(getHourFromISO8601(timestampCity).slice(0, 2))
    const sunrise = getHourFromISO8601(daily.sunrise[0]);
    const sunrisePrefix = Number(sunrise.slice(0, 2));
    const sunset = getHourFromISO8601(daily.sunset[0]);
    const sunsetPrefix = Number(sunset.slice(0, 2));
    const codeIconInAPI = current_weather.weathercode;
    const bigIcon = getWeatherIcon(codeIconInAPI, hourPrefix, sunrisePrefix, sunsetPrefix);
    const temperature = Math.round(current_weather.temperature);
    const description = getDescription(bigIcon);
    const pressure = Math.round(hourly.surface_pressure[hourPrefix]);
    const wind = Math.round(current_weather.windspeed);
    const gusts = Math.round(hourly.windgusts_10m[hourPrefix]);
    const humidity = hourly.relativehumidity_2m[hourPrefix];

    //Ajout de la température et de la description au localStorage (utilisé lors du prompt de OpenAI)
    let objectActiveCity = getLocalStorage(LOCALSTORAGE_ACTIVECITY_KEY);
    objectActiveCity.temperature = temperature;
    objectActiveCity.description = description;
    setLocalStorage(LOCALSTORAGE_ACTIVECITY_KEY, objectActiveCity);

    /**
     * ÉCRITURE DU DOM
     */
    const elCloneElements = elTemplateWeather.content.cloneNode(true);

    /* Elements du clone */
    const elCityName = elCloneElements.querySelector('.cityName h2')
    const elStateAndCountry = elCloneElements.querySelector('.cityName h3')
    const elCompleteDate = elCloneElements.querySelector('.cityName h4')
    const elBigIcon = elCloneElements.querySelector('.bigIcon')
    const elTemperature = elCloneElements.querySelector('.temperature')
    const elIconDescription = elCloneElements.querySelector('.iconDescription')
    const elWind = elCloneElements.querySelector('.wind>div:first-of-type')
    const elGusts = elCloneElements.querySelector('.wind>div:last-of-type')
    const elHumidity = elCloneElements.querySelector('.humidity>div')
    const elSunrise = elCloneElements.querySelector('.dataSun>div:first-of-type')
    const elSunset = elCloneElements.querySelector('.dataSun>div:last-of-type')
    const elPressure = elCloneElements.querySelector('.pressure>div')
    const elTodayEveryHour = elCloneElements.querySelector('.todayEveryHour')
    const forecastBody = elCloneElements.querySelector('.forecastBody')

    elCityName.textContent = activeCity.cityName;
    elStateAndCountry.textContent = activeCity.stateName ? `${activeCity.stateName}, ${activeCity.countryName}` : `${activeCity.countryName}`;
    elCompleteDate.textContent = completeDate;
    const elImg = document.createElement("img");
    elImg.setAttribute("src", `assets/images/weatherIcons/${bigIcon}.svg`);
    elImg.setAttribute("alt", 'icône météo');
    /*"Append" cumule les éléments si nouvelle recherche. "replaceChildren" remplace.*/
    elBigIcon.replaceChildren(elImg);
    elTemperature.textContent = temperature + "°";
    elIconDescription.textContent = description;
    elWind.textContent = "Vent: " + wind + "km/h";
    elGusts.textContent = "Rafales: " + gusts + "km/h";
    elHumidity.textContent = "Humidité: " + humidity + "%";
    elSunrise.textContent = sunrise;
    elSunset.textContent = sunset;
    elPressure.textContent = "Pression: " + pressure + "hPa";


    /* ***** TODAY ***** */
    /**
     * Les tableaux sont de la même longueur
     * On "mappe" [i] sur les valeurs des tableaux
     */

    const {time, weathercode, temperature_2m} = hourly;

    for (let i = 8; i <= 20; i = i + 2) {
        //On récupère l'heure, l'icône et la température en fonction de "array[i]"
        const prefixTime = Number(getHourFromISO8601(time[i]).slice(0, 2));
        const codeIcon = getWeatherIcon(weathercode[i], prefixTime, sunrisePrefix, sunsetPrefix);
        const temperature = Math.round(temperature_2m[i]);

        //l'heure
        const divTimeElement = document.createElement("div");
        divTimeElement.textContent = prefixTime + "h";

        //l'icône :
        const divImageElement = document.createElement("div");
        const elImg = document.createElement("img");
        elImg.setAttribute("src", `assets/images/weatherIcons/${codeIcon}.svg`);
        elImg.setAttribute("alt", "icône Météo");
        divImageElement.append(elImg);

        //température
        const divTemperatureElement = document.createElement("div");
        divTemperatureElement.textContent = temperature + "°";

        //div parente
        const divTimeSlotElement = document.createElement("div");
        divTimeSlotElement.classList.add("timeSlotElement");

        divTimeSlotElement.append(divTimeElement, divImageElement, divTemperatureElement);

        //injection
        elTodayEveryHour.append(divTimeSlotElement);
    }

    /* ***** FORECAST ***** */
    const {weathercode: codeIcon, temperature_2m_max, temperature_2m_min, time: arrayTime} = daily;
    for (let i = 1; i <= 6; i++) {
        const day = getDayFromISO8601(arrayTime[i]);
        //l'icône
        const icon = codeIcon[i];

        //Températures minimales et maximales
        const maxTemp = Math.round(temperature_2m_max[i]);
        const minTemp = Math.round(temperature_2m_min[i]);

        // Element jour
        const divDay = document.createElement("div");
        divDay.textContent = day;

        // Element icône :
        const divIMGElement = document.createElement("div");
        const elImg = document.createElement("img");
        elImg.setAttribute("src", `assets/images/weatherIcons/${icon}.svg`);
        elImg.setAttribute("alt", "icône Météo");
        divIMGElement.append(elImg);

        //Element TempMax
        const divMaxTemp = document.createElement("div");
        divMaxTemp.textContent = maxTemp + "°";

        //Element TempMax
        const divMinTemp = document.createElement("div");
        divMinTemp.textContent = minTemp + "°";

        //Element conteneur
        const divForecastDay = document.createElement("div");
        divForecastDay.classList.add("forecastDay");
        divForecastDay.append(divDay, divIMGElement, divMaxTemp, divMinTemp);

        //on injecte
        forecastBody.append(divForecastDay);
    }
    const elFavorites = elCloneElements.querySelector('.addFavorites')
    elWeatherContent.replaceChildren(elCloneElements);
    displayScrollIcon()
    // elButtonIA.classList.add('activeButton')
    // elAddFavorites.classList.add('activeButton')

    //Affichage de l'icône favoris si le user est connecté
    if (elFavorites) {
        updateIconFavorite(activeCity)
            .then(res => {
                elAddFavoritesButton.addEventListener('click', () => {
                    const cityID = elAddFavoritesButton.getAttribute('data-ID');
                    updateFavorites(action, cityID);
                });
            });
        //on place un écouteur de click sur le bouton add favoris

    }
    // const elButtonIA = document.querySelector('.buttonIA');
    // if (elButtonIA){
    //     elButtonIA.addEventListener('click', sendRequestActivities);
    // }
    // function sendRequestActivities(){
    //     let arrayActiveCity = getLocalStorage(LOCALSTORAGE_ACTIVECITY_KEY);
    // }

    /*************************************************************/
    /*************************************************************/
    /*************************************************************/
    // const arrayActiveCity = getLocalStorage(LOCALSTORAGE_ACTIVECITY_KEY);
    // const elButtonIA = document.querySelector('.buttonIA');
    // elButtonIA.addEventListener('click', async function (e) {
    //     e.preventDefault();
    //
    //     // const cityName = arrayActiveCity.cityName;  // Remplacez ceci par le nom de la ville
    //     const url = 'activites-a-faire';
    //
    //     await fetch(url, {
    //         method: "POST",
    //         headers: {"Content-Type": "application/json"},
    //         body: JSON.stringify({cityName: arrayActiveCity.cityName})
    //     }).then(() => {
    //         // Redirige vers la nouvelle page
    //         window.location.href = url;
    //     }).catch(error => console.error('Erreur:', error));
    //
    // });
    /*************************************************************/
    /*************************************************************/
    /*************************************************************/

}

function getDescription(bigIcon) {
    const descriptions = {
        0: "Très ensoleillé",
        "0n": "Ciel dégagé",
        1: "Ensoleillé",
        "1n": "Ciel dégagé",
        2: "Partiellement nuageux",
        "2n": "Partiellement nuageux",
        3: "Nuageux",
        45: "Brouillard",
        48: "Brouillard givré",
        51: "Bruine légère",
        53: "Bruine",
        55: "Bruine dense",
        56: "Bruine légère verglaçante",
        57: "Bruine dense verglaçante",
        61: "Faible pluie",
        63: "Pluie",
        65: "Forte pluie",
        66: "Faible pluie verglaçante",
        67: "Forte pluie verglaçante",
        71: "Faible chute de neige",
        73: "Chute de neige",
        75: "Forte chute de neige",
        77: "Neige en grains",
        80: "Légères averses",
        81: "Averses",
        82: "Fortes averses",
        85: "Faible chute de neige",
        86: "Fortes chute de neige",
        95: "Orage",
        96: "Orage et légère grêle",
        99: "Orage et forte grêle"
    };
    return descriptions[bigIcon] || "";
}

async function updateIconFavorite(activeCity) {

    // const elAddFavorites = document.querySelector('.addFavorites');
    elAddFavoritesButton = document.querySelector('.addFavorites button');
    const iconFavorite = document.querySelector('.addFavorites i')
    // const result = await requestFavorites(activeCity, '/isFavorite')
    const result = await callTheServer('isFavorite', activeCity)

    //Si pas encore présent dans le LS, son apparence propose d'ajouter la ville active aux favoris
    if (!result.exist) {
        // elAddFavoritesButton.style.color = "";
        elAddFavoritesButton.removeAttribute('style');
        iconFavorite.classList.replace('fa-heart-circle-minus', 'fa-heart-circle-plus');
        elAddFavoritesButton.setAttribute('data-action', 'add');
    } else {
        //sinon son apparence propose de supprimer la ville active des favoris
        elAddFavoritesButton.style.color = orangeColor;
        elAddFavoritesButton.style.borderColor = orangeColor;
        iconFavorite.classList.replace('fa-heart-circle-plus', 'fa-heart-circle-minus');
        elAddFavoritesButton.setAttribute('data-action', 'delete');
        elAddFavoritesButton.setAttribute('data-ID', result.cityID);
    }
    //2 - écouteur : au click, on enregistre les données de activecity en BDD
    action = elAddFavoritesButton.getAttribute('data-action');

    // elAddFavoritesButton.addEventListener('click', ()=>{
    //     updateFavorites(action);
    // });

}

/**
 *
 * @param action
 * @param cityID Si cityID existe, alors c'est une suppression
 * @returns {Promise<void>}
 */
async function updateFavorites(action, cityID) {
    //on récupère la ville active :
    let arrayActiveCity = getLocalStorage(LOCALSTORAGE_ACTIVECITY_KEY);
    if (cityID !== null) {
        arrayActiveCity.cityID = cityID;
    }
    if (arrayActiveCity) {
        try {
            await callTheServer(`${action}Favorites`, arrayActiveCity,)
            await updateIconFavorite(arrayActiveCity);
        } catch (error) {
            displayMessage(error);
        }
    } else {
        displayMessage("Erreur d'enregistrement, aucune ville active");
    }
}
