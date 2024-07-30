/* **** UX FONCTIONS  **** */

import {getLocalStorage} from "../localStorage.js";
import {LOCALSTORAGE_ACTIVECITY_KEY} from "../constants.js";
import {callTheServer} from "../serverRequest.js";
export const elSearchListUL = document.querySelector('.searchList ul');
export const elSearchList = document.querySelector('.searchList');
export const elSearchInput = document.querySelector('.formSearch input');
const elAlertError = document.querySelector('.alertError');
const elButtonProfile = document.querySelector('.buttonProfile')


export function deleteForm(e) {
    e.preventDefault();
    elSearchInput.value = "";
    hideList();
}

export function hideList() {
    elSearchListUL.innerHTML = "";
    elSearchList.classList.remove("showList");
}

export function displayMessage(message = "Erreur serveur...", timeout = 10000) {
    hideList();
    elAlertError.textContent = message;
    elAlertError.style.display = 'block';
    setTimeout(() => {
        elAlertError.style.display = 'none';
    }, timeout);
}

export function displayScrollIcon() {
    const scrolldownWrapper = document.querySelector('.scrolldownWrapper')
    if (scrolldownWrapper) {
        let observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                scrolldownWrapper.style.display = entry.isIntersecting ? "none" : "block";
            });
        });
        let currentlyCenter = document.querySelector('.currentlyCenter');
        observer.observe(currentlyCenter);
    }
}

export function preventEnterKey(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
    }
}

/**
 * Comportement menu profile et logout
 */
export function profileMenu() {
    if (elButtonProfile) {
        const menu = document.querySelector('.divMenuProfile');
        const btnAccessProfile = document.querySelector('.divMenuProfile button:first-of-type');
        elButtonProfile.addEventListener('click', function () {
            menu.classList.toggle('divMenuProfileShow');
        });
        document.addEventListener('click', (e) => {
            if (menu.classList.contains('divMenuProfileShow') && e.target !== btnAccessProfile && e.target !== elButtonProfile) {
                menu.classList.remove('divMenuProfileShow');
            }
        })

    }
}