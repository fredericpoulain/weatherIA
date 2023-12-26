import {callTheServer} from "./serverRequest.js";
import {getLocalStorage} from "./localStorage.js";
import {LOCALSTORAGE_ACTIVECITY_KEY} from "./constants.js";

const objectActiveCity = getLocalStorage(LOCALSTORAGE_ACTIVECITY_KEY);
const elTitle = document.querySelector('.title h1')
const elP1 = document.querySelector('.p1')
const elP2 = document.querySelector('.p2')
const elList = document.querySelector('.list')
const titleText = `Quelles activités à faire à ${objectActiveCity.cityName} ?`
const text1 = `Bonjour ! Je suis votre assistant météo ! Je suis programmé pour vous suggérer des activités à ${objectActiveCity.cityName} en fonction des conditions météorologiques actuelles.`
const text2 = `Voici une liste d'activités possibles : `

window.addEventListener('load', async () => {
    const stateInfo = objectActiveCity.stateName ? objectActiveCity.stateName : '';
    const cityName = `${objectActiveCity.cityName} (${stateInfo} ${objectActiveCity.countryName})`;
    const promptWeather = `${objectActiveCity.temperature}°C, ${objectActiveCity.description}`;
    elTitle.textContent = titleText;
    const typingPromise = (async () => {
        await typeText(text1, elP1);
        await typeText(text2, elP2);
        const imgElement = document.createElement("img");
        imgElement.src = "/assets/images/svg/loading.svg";
        elList.append(imgElement)

    })();

    const openAIResultPromise = callTheServer('getActivities', cityName, promptWeather);

    // Attendez que les deux tâches soient terminées
    const [_, openAIResult] = await Promise.all([typingPromise, openAIResultPromise]);

    // Utilisez le résultat de openAIResult

    elList.innerHTML = "";
    elList.style.textAlign = 'start';
    let activities = openAIResult.split('\n\n');
    for (const activity of activities) {
        // Séparer le numéro et le titre de l'activité du reste du texte
        let parts = activity.split(' : ');
        let title = parts[0];
        let text = parts[1];

        // Créer un nouvel élément de paragraphe
        const paragraphe = document.createElement("p");

        // Créer un élément de texte en gras pour le titre
        const boldTitle = document.createElement("strong");
        boldTitle.textContent = text ? title + ": " : title;

        // Ajouter le titre en gras et le reste du texte au paragraphe s'il existe.
        paragraphe.appendChild(boldTitle);
        if (text) { // Ajoutez cette condition
            paragraphe.appendChild(document.createTextNode(text));
        }

        // Ajouter le paragraphe à la liste
        elList.append(paragraphe);
    }


})


function typeText(text, el) {
    return new Promise((resolve, reject) => {
        let i = 0;
        let interval = setInterval(function() {
            if (i < text.length) {
                el.innerHTML += text[i];
                i++;
            } else {
                clearInterval(interval);
                resolve();  // Résout la promesse lorsque le texte a fini d'être tapé
            }
        }, 30);
    });
}



// function afficherPhrase (phrase, element) {
//     // Initialiser un compteur à 0
//     let i = 0;
//     // Créer une fonction qui affiche un caractère à la fois
//     function afficherCaractere () {
//         // Récupérer le caractère à la position i dans la phrase
//         let caractere = phrase.charAt(i);
//         // Ajouter le caractère à l'élément HTML
//         element.textContent += caractere;
//         // Augmenter le compteur de 1
//         i++;
//         // Vérifier si le compteur est inférieur à la longueur de la phrase
//         if (i < phrase.length) {
//             // Si oui, appeler la fonction afficherCaractere avec un délai de 100 millisecondes
//             setTimeout(afficherCaractere, 90);
//         }
//     }
//     // Appeler la fonction afficherCaractere une première fois
//     afficherCaractere();
// }