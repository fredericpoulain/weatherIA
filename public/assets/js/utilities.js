const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const mois = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];


export function getHourFromISO8601(timestamp) {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}h${minutes}`;
}

export function getDayFromISO8601(stringDate) {
    const date = new Date(stringDate);
    return jours[date.getDay()];
}

export function getCompleteDate(timestamp) {
    const date = new Date(timestamp);
    const jour = jours[date.getDay()];
    const numeroDuJour = date.getDate().toString().padStart(2, '0');
    const nomDuMois = mois[date.getMonth()];
    return `${jour} ${numeroDuJour} ${nomDuMois}`
}

/**
 *
 * @param codeIcon
 * @param hourPrefix
 * @param sunrisePrefix
 * @param sunsetPrefix
 * @returns {*}
 * return nightIcons[codeIcon] :
 * Si l'icône récupérée par l'API représente une icône de type "jour", ET qu'il est présent dans l'objet,
 * alors, on retourne son équivalent "nuit".
 * return codeIcon :
 * Sinon on retourne codeIcon car l'icône peut aussi bien représenter une météo de type jour ou nuit.
 * Dans cet exemple, nightIcons est un objet qui mappe les codes d’icônes de jour (0, 1, 2)
 * aux codes de nuit correspondants (‘0n’, ‘1n’, ‘2n’).
 * S'il fait encore nuit, la fonction vérifie si codeIcon est une clé dans nightIcons.
 * Si c’est le cas, elle renvoie la valeur correspondante de nightIcons. Sinon, elle renvoie codeIcon tel quel.
 */
export function getWeatherIcon(codeIcon, hourPrefix, sunrisePrefix, sunsetPrefix) {
    const nightIcons = {0: '0n', 1: '1n', 2: '2n'};
    // Cette condition vérifie s'il fait nuit :
    if (hourPrefix < sunrisePrefix || hourPrefix > sunsetPrefix) {
        return nightIcons[codeIcon] || codeIcon;
    }
    return codeIcon;
}


/**
 * @param elParent
 * @param HTMLElement
 * @returns {number}
 */
export function totalHeightChildrens(elParent, HTMLElement) {
    const allElement = elParent.querySelectorAll(HTMLElement);
    let totalHeight = 0;
    let totalMarginBottom = 0;
    for (let timeslot of allElement) {
        totalHeight += timeslot.offsetHeight;
        totalMarginBottom += parseInt(window.getComputedStyle(timeslot).marginBottom);
    }
    return totalHeight + totalMarginBottom;
}

export function loadListenerScroll(btnScrollTop) {
    window.addEventListener('scroll', () => {
        if (window.scrollY >= 200) {
            btnScrollTop.style.display = "block";
            btnScrollTop.addEventListener("click", function () {
                window.scrollTo(0, 0);
            });
        } else {
            btnScrollTop.style.display = "none";
        }
    });
}