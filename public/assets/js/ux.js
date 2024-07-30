export const regexMail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// export const ERRORCOLOR_BACKGROUND = '#d75966';
export const ERRORCOLOR_TEXT = '#d75966';
export const SUCCESSCOLOR_BACKGROUND = '#27db7c';
export const SUCCESSCOLOR_TEXT = '#0e3b23';

//affiche une alerte si les champs sont vides ou si le format est incorrect
export function styleAlerte(element, message) {
    element.previousElementSibling.textContent = message;
    element.previousElementSibling.style.color = '#9F3E48';
}

//efface les alertes et remet le label par défaut
export function deleteStyleAlert(element, labelText, elAlert) {

    element.previousElementSibling.textContent = labelText;
    element.previousElementSibling.style.color = '';
    element.previousElementSibling.removeAttribute('style');
    elAlert.textContent = "";
    elAlert.style.backgroundColor = "";
    elAlert.style.color = "";
    elAlert.removeAttribute('style');
}

