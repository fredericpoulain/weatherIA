import {callTheServer, getWeather} from "../serverRequest.js";
import {setLocalStorage} from "../localStorage.js";
import {LOCALSTORAGE_ACTIVECITY_KEY} from "../constants.js";
import {getHourFromISO8601, getWeatherIcon} from "../utilities.js";
import {dragend, dragOver, dragStart, drop, elUl, initDrag, ElLiMove} from "./animations.js";

const elTemplateLi = document.querySelector('.templateLi');
export const elAlertError = document.querySelector('.alertError');

export async function createDOM(favoriteCities){
    for (let city of favoriteCities) {
        const resultWeather = await getWeather(city.latitude, city.longitude, city.timezoneName);

        const cityName = city.cityName;
        const countryName = city.countryName;
        // const stateName = city.stateName;
        const temperature = Math.round(resultWeather.current_weather.temperature);

        /* find correctly icon depending on the time*/
        const resultLocalTime = await callTheServer('localTime', city.latitude, city.longitude);
        const timestampCity = resultLocalTime.timestampCity;
        const hourPrefix = Number(getHourFromISO8601(timestampCity).slice(0, 2));
        const sunrise = getHourFromISO8601(resultWeather.daily.sunrise[0]);
        const sunrisePrefix = Number(sunrise.slice(0, 2));
        const sunset = getHourFromISO8601(resultWeather.daily.sunset[0]);
        const sunsetPrefix = Number(sunset.slice(0, 2));
        const codeIconInAPI = resultWeather.current_weather.weathercode;
        const icon = getWeatherIcon(codeIconInAPI, hourPrefix, sunrisePrefix, sunsetPrefix);

        /* template cloning, and selection of clone elements*/
        const elLiClone = elTemplateLi.content.cloneNode(true);
        const elLi = elLiClone.querySelector('li');
        const elCityName = elLiClone.querySelector('.infoCity>div:nth-child(1)');
        const elTemperature = elLiClone.querySelector('.infoCity>div:nth-child(2)');
        const elIMG = elLiClone.querySelector('.infoCity>div:nth-child(3) img');
        const elBtnDelete = elLiClone.querySelector('.delete');
        const elGrip = elLiClone.querySelector('.grip');
        /* insert value in elements */
        elLi.setAttribute('data-sort', city.sort)
        elLi.setAttribute('data-id', city.cityID)
        // elCityName.textContent = cityName;
        elCityName.textContent = `${cityName}, ${countryName}`
        elTemperature.textContent = `${temperature}°`;
        elIMG.setAttribute('src', `/assets/images/weatherIcons/${icon}.svg`);

        /**
         * On initialise l'attribut draggable pour chaque element en plaçant des "event" au clic
         * On supprime ces attributs en cas de mouseUp et de Dragend
         */
        elGrip.addEventListener('mousedown', initDrag);

        elLi.addEventListener('mouseup', (e) => {
            elLi.removeAttribute('draggable');
        });
        elLi.addEventListener('dragend', dragend);
        elLi.addEventListener("dragstart", dragStart);
        elLi.addEventListener("dragover", dragOver);
        elLi.addEventListener("drop", drop);

        // elGrip.addEventListener('touchstart', initDrag);
        // elLi.addEventListener('touchend', (e) => {
        //     elLi.removeAttribute('draggable');
        // });
        // elLi.addEventListener('touchcancel', dragend);
        // elLi.addEventListener('touchmove', dragStart);

        /* insert element in DOM */
        elUl.append(elLiClone);
        elCityName.addEventListener('click', selectCity)
        elBtnDelete.addEventListener('click', deleteCity)
    }
}

//pas de fonction fléchée, car j'ai besoin d'accéder à "this" (même chose pour les autres fonctions concernées)
async function selectCity() {
    const cityID = findID(this);
    try {
        // const objCity = await requestFavorites({'cityID': Number(cityID)}, '/getCityBdd')
        const objCity = await callTheServer('getCityBdd', Number(cityID) )

        setLocalStorage(LOCALSTORAGE_ACTIVECITY_KEY, objCity);
        //redirection
        window.location.href = "/";
    } catch (error) {
        displayAlertError(error.message);
    }
}

async function deleteCity() {
    const cityID = findID(this);
    try {
        // await requestFavorites({'cityID': Number(cityID)}, '/deleteFavorites')
        await callTheServer('deleteFavorites', {'cityID': Number(cityID)} )
        // updateFavoriteLocalStorage(index);
        const elParentLi = this.closest('li');
        elParentLi.classList.add("deleteAnimation");
        elParentLi.addEventListener('transitionend', (e) => {
            if (e.propertyName === 'height') {
                elParentLi.remove();
                const allLi = document.querySelectorAll('.favoritesContent ul li');
                //loop at specific index it's not possible
                //updates 'data-index' attributes of all elements in DOM
                let newIndex = 1;
                for (let li of allLi) {
                    li.setAttribute('data-sort', newIndex);
                    newIndex++;
                }
            }
        })
    } catch (error) {
        displayAlertError(error.message);
    }
}

const findID = target => target.closest('li').getAttribute('data-id');

export const updateDOM = (positionPointer, positionElLiMove, betweenElements) => {
    let elementsMoved = [];
    //pointerAfter = 'true' si le pointer se trouve en dessous du bloc betweenElements
    const pointerAfter = positionPointer > positionElLiMove;
    //targetElement = dernier element de betweenElements sinon premier element
    const targetElement = pointerAfter ? betweenElements.at(-1) : betweenElements[0];
    //on récupère la valeur de data-sort de targetElement
    const sortValue = targetElement.getAttribute('data-sort');

    // On déplace elLiMove en fonction de la position du pointer
    pointerAfter ? targetElement.after(ElLiMove) : targetElement.before(ElLiMove)
    ElLiMove.setAttribute('data-sort', sortValue);
    ElLiMove.removeAttribute('style');

    const elLiMoveIdValue = ElLiMove.getAttribute('data-id');
    const elLiMoveSortValue = ElLiMove.getAttribute('data-sort');
    elementsMoved.push({cityID: elLiMoveIdValue, citySort: elLiMoveSortValue});

    // On met à jour les 'data-sort' des éléments de betweenElements
    //si le pointer se trouve en dessous de betweenElements, tous les 'data-sort' de betweenElements vont être décrémentés de 1,
    //Sinon ils seront incrémentés de 1.

    betweenElements.forEach((li) => {
        const sortToModify = Number(li.getAttribute('data-sort'));
        li.setAttribute('data-sort', pointerAfter ? sortToModify - 1 : sortToModify + 1);

        const liSortValue = li.getAttribute('data-sort');
        const liIdValue = li.getAttribute('data-id');
        elementsMoved.push({cityID: liIdValue, citySort: liSortValue});

        li.style.transform = 'none';
        li.style.transitionProperty = 'none';
        // Utiliser requestAnimationFrame pour une meilleure performance que setTimeout
        setTimeout(function () {
            li.removeAttribute('style');
        }, 0);
    });
    return elementsMoved;
}

export const displayAlertError = (message = null) => {
    elAlertError.textContent = message || "Une erreur est survenue";
    elAlertError.style.display = 'block';
}