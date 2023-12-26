import {getWeather} from "../serverRequest.js";
import { getHourFromISO8601, getWeatherIcon, totalHeightChildrens, loadListenerScroll, getCompleteDate} from '../utilities.js';
import {  displayChartTemp, displayChartWinds, displayChartHumidity, displayChartCloudcover, resizeChart,} from './charts.js';
import { LOCALSTORAGE_ACTIVECITY_KEY,} from '../constants.js';
import { getLocalStorage, } from '../localStorage.js';

const elLoading = document.querySelector('.loading');
const elCityName = document.querySelector(".titleBloc h1");
const elTemplateDay = document.querySelector(".templateDay");
const elTemplateLi = document.querySelector(".templateLi");
const elContainerDays = document.querySelector(".containerDays");
const elAlertError = document.querySelector('.alertError');
const btnScrollTop = document.querySelector('.btnScrollTop');





window.addEventListener("load", async () => {
    const activeCity = getLocalStorage(LOCALSTORAGE_ACTIVECITY_KEY);
    if (activeCity) {
        try {
            elLoading.classList.add('activeLoading');
            const resultWeather = await getWeather(activeCity.latitude, activeCity.longitude, activeCity.timezoneName);
            // Définir le nombre d'heures dans une journée
            const objWeather = resultWeather.hourly;
            const arraySunrise = resultWeather.daily.sunrise;
            const arraySunset = resultWeather.daily.sunset;
            let nextDay = 1;
            elCityName.textContent = activeCity.cityName;
            // Boucler du deuxième jour (index 24) au dernier jour de la semaine
            for (let i = 24; i < objWeather.time.length; i += 24) {
                // Récupérer les données météo pour le jour actuel
                const sunrise = getHourFromISO8601(arraySunrise[nextDay]);
                const sunrisePrefix = Number(sunrise.slice(0, 2));
                const sunset = getHourFromISO8601(arraySunset[nextDay]);
                const sunsetPrefix = Number(sunset.slice(0, 2));

                const dailyTime = objWeather.time.slice(i, i + 24);
                const dailyTemperatures = objWeather.temperature_2m.slice(i, i + 24).map(Math.round);
                const dailyWeathercode = objWeather.weathercode.slice(i, i + 24);
                const dailyWindspeed = objWeather.windspeed_10m.slice(i, i + 24).map(Math.round);
                const dailyWindgusts = objWeather.windgusts_10m.slice(i, i + 24).map(Math.round);
                const dailyHumidity = objWeather.relativehumidity_2m.slice(i, i + 24);
                const dailyCloudcover = objWeather.cloudcover.slice(i, i + 24);

                const elDayClone = elTemplateDay.content.cloneNode(true);
                // const dayName = getDayFromISO8601(resultWeather.daily.time[nextDay]);
                const date = getCompleteDate(resultWeather.daily.time[nextDay]);

                const elDate = elDayClone.querySelector('.nameDay')
                elDate.textContent = date;

                for (let j = 0; j < dailyTime.length; j++) {
                    const time = getHourFromISO8601(dailyTime[j]).slice(0, 2);
                    const temperature = dailyTemperatures[j];
                    const icon = getWeatherIcon(dailyWeathercode[j], time, sunrisePrefix, sunsetPrefix);
                    const wind = dailyWindspeed[j];
                    const gust = dailyWindgusts[j];
                    const humidity = dailyHumidity[j];

                    const elLiClone = elTemplateLi.content.cloneNode(true);
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

                    const elTemplateListPerHours = elDayClone.querySelector('.listPerHours')
                    elTemplateListPerHours.append(elLiClone);
                }

                elContainerDays.append(elDayClone);

                // charts.js MUST select elements IN the DOM, so after the "append"...
                const lastChildDay = elContainerDays.lastElementChild;
                const elTempChart = lastChildDay.querySelector('.tempChart')
                const elWindsChart = lastChildDay.querySelector('.windsChart')
                const elHumidityChart = lastChildDay.querySelector('.humidityChart')
                const elCloudcoverChart = lastChildDay.querySelector('.cloudcoverChart')

                displayChartTemp(elTempChart, dailyTemperatures);
                displayChartWinds(elWindsChart, dailyWindspeed, dailyWindgusts);
                displayChartHumidity(elHumidityChart, dailyHumidity);
                displayChartCloudcover(elCloudcoverChart, dailyCloudcover);

                nextDay++
            }

            const ALLContentChart = document.querySelectorAll('.contentChart');
            ALLContentChart.forEach(contentChart => {
                const ALLCanvasFromThis = contentChart.querySelectorAll('canvas');
                resizeChart(contentChart, ALLCanvasFromThis);
                window.addEventListener('resize', function () {
                    resizeChart(contentChart, ALLCanvasFromThis);
                });

            })

            listenerForAccordion(".perHoursTitle", ".listPerHours", ".contentChart", ".chevron", 'li');
            listenerForAccordion(".titleChart", ".listPerHours", ".contentChart", ".chevron", 'div > div:first-child');

        } catch (error) {
            elAlertError.textContent = "Une erreur est survenue";
            elAlertError.style.display = 'block';
        } finally {
            loadListenerScroll(btnScrollTop)
            elLoading.classList.remove('activeLoading');
        }
    } else {
        window.location.href = "/";
    }


});
/* **** SHOW or HIDE LIST UL AND CHARTS **** */
function listenerForAccordion(selectorListener, selectorReduce, selectorExpand, selectorChevron, selectorHeight) {
    const ALLlistener = document.querySelectorAll(selectorListener);
    ALLlistener.forEach(element => {
        element.addEventListener("click", () => {
            //reduce all elements :
            reduceElement(document.querySelectorAll(selectorReduce));
            reduceElement(document.querySelectorAll(selectorExpand));
            //init all chevrons :
            initChevron(document.querySelectorAll(selectorChevron));

            const elExpand = element.nextElementSibling;
            const elChevron = element.querySelector('.chevron');
            if (elExpand.offsetHeight === 0) {
                elExpand.style.maxHeight = `${totalHeightChildrens(elExpand, selectorHeight)}px`;
                elChevron.style.transform = "rotate(90deg)";
            } else {
                elExpand.style.maxHeight = '0';
                elExpand.removeAttribute('style');
                elChevron.style.transform = "rotate(0deg)";
                elChevron.removeAttribute('style');

            }
            setTimeout(() => {
                element.scrollIntoView({behavior: "smooth"});
            }, 300);
        });
    });
}

function reduceElement(AllElements) {
    AllElements.forEach((element) => {
        element.style.maxHeight = '0';
        element.removeAttribute('style');
    });
}

function initChevron(ALLchevron) {
    ALLchevron.forEach((chevron) => {
        chevron.style.transform = "rotate(0deg)";
        chevron.removeAttribute('style');
    });
}





