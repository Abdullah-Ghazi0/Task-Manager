import { addBtn, titleField, form, closeBtn, newTaskbtn, fab, modal, dateFilter, searchBar, prioFilter, sortFilter, taskWindow } from "./dom.js";

import { state } from "./state.js";
import { render } from "./render.js";
import { saveEditChanges, createNewTask, toggleModal } from "./modal.js";
import { dragStart } from "./dragdrop.js";
import { manageTouch } from "./touch.js";
import { trackEvent } from "./utils.js";

export function addEventListners() {
    addBtn.addEventListener('click', e => {

        if (addBtn.classList.contains("disabled")) return;
        if (state.editState) {
            saveEditChanges();
        }
        else {
            createNewTask();
        }
    })

    window.addEventListener('keydown', e => {
        if (e.key !== "Enter") return;
        if (!state.modal) return;
        if (addBtn.classList.contains("disabled")) return;
        if (state.editState) {
            saveEditChanges();
        }
        else {
            createNewTask();
        }
    })

    window.addEventListener('click', e => {
        if (!e.target.closest('.card')) {
            const expandedCard = document.querySelector('.expanded');
            if (expandedCard) {
                expandedCard.classList.remove("expanded");
            }
        }
    })

    titleField.addEventListener('input', ()=> {
        if (titleField.value !== '') {
            addBtn.classList.remove("disabled")
        } else {
            addBtn.classList.add("disabled")
        }
        
    })

    form.addEventListener('submit', e => {
        e.preventDefault();
    })

    closeBtn.addEventListener("click", toggleModal)

    newTaskbtn.addEventListener("click", toggleModal)
    fab.addEventListener('click', toggleModal)

    modal.addEventListener('click', (e)=> {
        if (e.target === modal) {
            toggleModal();
        }
    })

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && state.modal) toggleModal();
    })

    searchBar.addEventListener('input', e => {
        let searchQuery = searchBar.value;
        state.search = searchQuery.toLowerCase();
        render();
    })

    dateFilter.addEventListener('change', e => {
        state.filters.date = dateFilter.value;
        render();
        trackEvent('filter_used', { type: 'date' });
    })

    prioFilter.addEventListener('change', e => {
        state.filters.priority = prioFilter.value;
        render();
        trackEvent('filter_used', { type: 'prority' });
    })

    sortFilter.addEventListener('change', e => {
        state.sortBy = sortFilter.value;
        render();
        trackEvent('filter_used', { type: 'sort' });
    })

    taskWindow.addEventListener('pointerdown', dragStart);

    taskWindow.addEventListener('touchstart', manageTouch)
}