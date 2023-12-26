import { LOCALSTORAGE_ACTIVECITY_KEY, } from '../constants.js';
import { getHourFromISO8601, getWeatherIcon, loadListenerScroll, totalHeightChildrens } from '../utilities.js';
import { displayChartTemp, displayChartWinds, displayChartHumidity, displayChartCloudcover, resizeChart, } from './charts.js';
import { getLocalStorage, } from '../localStorage.js';
import {getWeather} from "../serverRequest.js";

const elTempChart = document.querySelector('.tempChart');
const elWindsChart = document.querySelector('.windsChart');
const elHumidityChart = document.querySelector('.humidityChart');
const elCloudcoverChart = document.querySelector('.cloudcoverChart');
const allCanvas = document.querySelectorAll('canvas');
const elContentChart = document.querySelector('.contentChart');
const elPerHoursTitle = document.querySelector(".perHoursTitle");
const elChevron = document.querySelector(".chevron");
const elListTemplate = document.querySelector(".listTemplate");
const elListPerHours = document.querySelector(".listPerHours");
const elH1 = document.querySelector(".titleBloc h1");
const btnScrollTop = document.querySelector('.btnScrollTop');
const elAlertError = document.querySelector('.alertError');
const elLoading = document.querySelector('.loading');

window.addEventListener("load", async () => {
    const activeCity = getLocalStorage(LOCALSTORAGE_ACTIVECITY_KEY);
    if (activeCity){
        try {
            elLoading.classList.add('activeLoading');
            const resultWeather = await getWeather(activeCity.latitude, activeCity.longitude, activeCity.timezoneName);
            const temperatures = resultWeather.hourly.temperature_2m.slice(0, 24).map(Math.round);
            const humidity = resultWeather.hourly.relativehumidity_2m.slice(0, 24);
            const windspeed = resultWeather.hourly.windspeed_10m.slice(0, 24).map(Math.round);
            const windgusts = resultWeather.hourly.windgusts_10m.slice(0, 24).map(Math.round);
            const cloudcover = resultWeather.hourly.cloudcover.slice(0, 24);
            elH1.textContent = activeCity.cityName;
            displayListPerHours(resultWeather, temperatures, windspeed, windgusts);
            displayChartTemp(elTempChart, temperatures);
            displayChartWinds(elWindsChart, windspeed, windgusts);
            displayChartHumidity(elHumidityChart, humidity);
            displayChartCloudcover(elCloudcoverChart, cloudcover);
            loadListenerScroll(btnScrollTop);
            resizeChart(elContentChart, allCanvas);
            window.addEventListener('resize', function() {
                resizeChart(elContentChart, allCanvas);
            });

        }catch (error) {
            elAlertError.textContent = "Une erreur est survenue";
            elAlertError.style.display = 'block';
        } finally {
            elLoading.classList.remove('activeLoading');
        }
    }else{
        window.location.href = "/";
    }
});

/*LIST PER HOURS*/
function displayListPerHours(resultWeather, temperatures, windspeed, windgusts) {

    for (let i = 0; i <= 23; i++) {
        const h = resultWeather.hourly;
        const d = resultWeather.daily;
        const time = getHourFromISO8601(h.time[i]).slice(0, 2);
        const temperature = temperatures[i];
        /* find correctly icon depending on the time*/
        const sunrise = getHourFromISO8601(d.sunrise[0]);
        const sunrisePrefix = Number(sunrise.slice(0, 2));
        const sunset = getHourFromISO8601(d.sunset[0]);
        const sunsetPrefix = Number(sunset.slice(0, 2));
        const icon = getWeatherIcon(h.weathercode[i], time, sunrisePrefix, sunsetPrefix);
        const wind = windspeed[i];
        const gust = windgusts[i];
        const humidity = h.relativehumidity_2m[i];

        const elLiClone = elListTemplate.content.cloneNode(true);
        const elTime = elLiClone.querySelector('.time');
        const elTemp = elLiClone.querySelector('.temp');
        const elIcon = elLiClone.querySelector('.icon img');
        const elWind = elLiClone.querySelector('.winds > div:first-of-type');
        const elGust = elLiClone.querySelector('.winds > div:last-of-type');
        const elHumidity = elLiClone.querySelector('.humidity');

        elTime.textContent = time + 'h';
        elTemp.textContent = temperature + resultWeather.hourly_units.temperature_2m;
        elIcon.setAttribute('src', `/assets/images/weatherIcons/${icon}.svg`);
        elWind.textContent = wind + resultWeather.hourly_units.windspeed_10m;
        elGust.textContent = gust + resultWeather.hourly_units.windgusts_10m;
        elHumidity.textContent = humidity + resultWeather.hourly_units.relativehumidity_2m;

        elListPerHours.append(elLiClone);

    }
}

/* **** SHOW LIST UL **** */
elPerHoursTitle.addEventListener("click", () => {
    if (elListPerHours.offsetHeight === 0) {
        elListPerHours.style.maxHeight = `${totalHeightChildrens(elListPerHours, 'li')}px`;
        elChevron.style.transform = "rotate(90deg)";
    } else {
        elListPerHours.style.maxHeight = '0px';
        elListPerHours.removeAttribute('style');
        elChevron.style.transform = "rotate(0deg)";
        elChevron.removeAttribute('style');
    }
});




