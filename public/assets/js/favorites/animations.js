import {callTheServer} from "../serverRequest.js";
import {updateDOM, elAlertError} from "./favoritesDOM.js";
export const elUl = document.querySelector('.favoritesContent ul');

/* ****         UTILS DRAD&DROP           **** */

//le pointer du drag&drop
const elPointer = document.createElement('li');
elPointer.classList.add('pointer')
elPointer.addEventListener('dragover', (e) => {
    e.preventDefault()
});
elPointer.addEventListener('drop', drop);

//On créé une variable en début de code qui nous servira à attribuer l'élément en déplacement.
// Ainsi, on aura accès à cet élément partout dans le code
export let ElLiMove;

/* ****          FIN UTILS DRAD&DROP              **** */

/**
 * Lorsque le bouton de la souris est enfoncé, on ajoute dynamiquement l'attribut "draggable" à son parent.
 * Si la hiérarchie est plus profonde, on peut utiliser la méthode "closest" pour remonter vers un parent spécifique
 */
export function initDrag() {
    console.log('initDrag');
    const elLi = this.parentNode;
    elLi.setAttribute('draggable', true);

}

/**
 * L’événement dragstart se produit qu'UNE SEULE FOIS au début du glissement
 */
export function dragStart() {

    console.log('dragStart');
    this.classList.add('dragStart');
    ElLiMove = this;
    elUl.classList.add('dragInProgress')

}

export function dragend() {
    console.log('dragend');
    this.removeAttribute('draggable');
    this.classList.remove('dragStart');
    elUl.classList.remove('dragInProgress')
    const pointerInDOM = document.querySelector('.pointer');
    if (pointerInDOM) {
        elPointer.remove();
    }
}

/**
 * L’événement dragover se produit constamment pendant le glissement
 */
export function dragOver(e) {
    console.log('dragOver')
    /**
     * e.preventDefault() permet à l’événement de dépôt de se produire.
     * Dans le MDN : "Si vous voulez autoriser un dépôt, vous devez empêcher le comportement par défaut en annulant l'événement."
     * https://developer.mozilla.org/fr/docs/Web/API/HTML_Drag_and_Drop_API/Drag_operations#sp%C3%A9cifier_les_cibles_de_d%C3%A9p%C3%B4t
     */
    e.preventDefault();
    const curseur = e.offsetY;
    const hoverLi = this; //Élément survolé
    const halfHeightHoverLi = hoverLi.offsetHeight / 2; // moitié de l'élément en pixel
    /**
     * On supprime le pointer :
     * si l'élément survolé est égale à l'élément déplacé OU
     * si l'élément survolé est égale à l'élément se trouvant avant celui qui est déplacé ET que le curseur se trouve sur la partie inférieure OU
     * si l'élément survolé est égale à l'élément se trouvant après celui qui est déplacé ET que le curseur se trouve sur la partie supérieure
     */
    if (hoverLi === ElLiMove ||
        (hoverLi === ElLiMove.previousElementSibling && curseur > halfHeightHoverLi) ||
        (hoverLi === ElLiMove.nextElementSibling && curseur <= halfHeightHoverLi)
    ) {
        elPointer.remove();
    } else {
        if (curseur <= halfHeightHoverLi) {
            if (hoverLi.previousElementSibling !== elPointer) {
                hoverLi.before(elPointer);
            }
        } else {
            if (hoverLi.nextElementSibling !== elPointer) {
                hoverLi.after(elPointer);
            }
        }
    }
}

export async function drop() {

    const pointerInDOM = document.querySelector('.pointer');
    if (pointerInDOM) {
        // Obtient tous les éléments <li>
        let allLi = Array.from(document.querySelectorAll('.favoritesContent ul li'));
        // Trouve l'index de l'élément avec la classe 'pointer'
        let pointerIndex = allLi.findIndex(li => li.classList.contains('pointer'));
        // Trouve l'index de l'élément avec la classe 'dragStart'
        let dragStartIndex = allLi.findIndex(li => li.classList.contains('dragStart'));
        //Si le pointeur se trouve en dessous de l'élément en mouvement,
        //la logique du code nous oblige à intervertir les valeurs pour obtenir "betweenElements" plus bas,
        //car les index du slice seraient erronés.
        if (pointerIndex > dragStartIndex) {
            [pointerIndex, dragStartIndex] = [dragStartIndex, pointerIndex];
        }
        // Obtient les éléments entre 'pointer' et 'dragStart'
        let betweenElements = allLi.slice(pointerIndex + 1, dragStartIndex);

        const positionElLiMove = ElLiMove.offsetTop;
        const positionPointer = pointerInDOM.offsetTop;
        //si le pointeur se trouve au-dessus de 'elLiMove',
        // alors les 'li' entre elLiMove et pointeur doivent descendre.
        let valueTranslateYblocLi = heightWithMargin(ElLiMove);
        let valueTranslateElLiMove = betweenElements.reduce((acc, li) => {
            return acc + heightWithMargin(li)
        }, 0);
        // Si pointeur au-dessus
        if (positionPointer > positionElLiMove) {
            valueTranslateYblocLi = valueTranslateYblocLi * -1
        } else {
            valueTranslateElLiMove = valueTranslateElLiMove * -1
        }
        ElLiMove.style.zIndex = '1';
        ElLiMove.style.position = 'relative';

        try {
            /* ** ANIMATION DRAG & DROP ** */
            await animate(betweenElements, valueTranslateYblocLi, valueTranslateElLiMove);
            /* ** Mise à jour du DOM ** */
            const elementData = updateDOM(positionPointer, positionElLiMove, betweenElements);
            /* ** Mise à jour du LocalStorage (persistance) ** */
            // updateLocalStorageDragAndDrop(pointerInDOM);
            // await requestFavorites(elementData, '/updateFavorites')
            await callTheServer('updateFavorites', elementData, )

        } catch (error) {
            elAlertError.textContent = error.message || "Une erreur est survenue";
            elAlertError.style.display = 'block';
        }
    }
}
const animate = async (betweenElements, valueTranslateYblocLi, valueTranslateElLiMove) => {
    await transition(ElLiMove, 'scale(1.07)');
    betweenElements.forEach(element => {
        element.style.transform = `translateY(${valueTranslateYblocLi}px)`;
    });
    await transition(ElLiMove, `scale(1.07) translateY(${valueTranslateElLiMove}px)`);
    await transition(ElLiMove, `scale(1) translateY(${valueTranslateElLiMove}px)`);
    ElLiMove.style.zIndex = '0';
    ElLiMove.style.position = 'static';
}
const transition = (element, transform) => {
    return new Promise((resolve) => {
        element.style.transform = transform;
        const handleTransitionEnd = e => {
            if (e.propertyName === 'transform') {
                element.removeEventListener('transitionend', handleTransitionEnd);
                resolve();
            }
        }
        element.addEventListener('transitionend', handleTransitionEnd);
    });
}

const heightWithMargin = el => el.offsetHeight + parseInt(window.getComputedStyle(el).marginTop);
