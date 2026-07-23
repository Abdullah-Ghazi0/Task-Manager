import { state, changeTaskColumn } from "./state.js";
import { getTaskFromId } from "./utils.js";
import { render } from "./render.js";
import { updateStorage } from "./storage.js";

import { inProgress } from "./dom.js";

export function dragStart(e) {
    if (e.target.closest('button')) return;
    if (e.target.closest('select')) return;

    const card = e.target.closest('.card')
    if (!card) return

    card.setPointerCapture(e.pointerId);
    state.drag.elem = card;
    state.drag.from = card.parentElement.id;
    state.drag.startX = e.clientX;
    state.drag.startY = e.clientY;

    document.body.classList.add('no-select');
    document.addEventListener('pointermove', dragMove);
    document.addEventListener('pointerup', dragEnd);
    createSkeletonCard()
}

function dragMove(e) {
    const dx = e.clientX - state.drag.startX;
    const dy = e.clientY - state.drag.startY;

    if (!state.drag.dragging) {
        if (Math.hypot(dx, dy) < 8) return;
        initDragging();
    }
    
    state.drag.virtual.style.left = `${e.clientX}px`;
    state.drag.virtual.style.top = `${e.clientY}px`;
}

function dragEnd(e) {
    document.removeEventListener('pointermove', dragMove);
    document.removeEventListener('pointerup', dragEnd);

    document.body.classList.remove('no-select');

    const elem = document.elementFromPoint(e.clientX, e.clientY);
    const newColumn = elem?.closest('.taskList');

    if (!state.drag.dragging) {
        resetDragState();
        return;   
    }

    if (newColumn) {
        changeStatusOnDrag(newColumn, e.clientY);
    }

    state.drag.virtual.remove();
    state.drag.elem.classList.remove('dim-card')
    resetDragState();
}

function changeStatusOnDrag(newColumn, cordsY) {
    const newStatus = newColumn.id;
    const draggingTaskId = Number(state.drag.elem.dataset.taskId)

    const task = getTaskFromId(draggingTaskId)
    task.changeStatus(newStatus)

    const insertBefore = getDropPosition(newColumn, cordsY, state.drag.elem)

    changeTaskColumn(state.drag.from, newStatus, draggingTaskId, insertBefore);
    updateStorage();
    render();
}

function initDragging() {
    state.drag.dragging = true;
    state.drag.elem.classList.add('dim-card')
    
    state.drag.virtual = state.drag.elem.cloneNode(true);
    state.drag.virtual.classList.add('virtual-card')

    document.body.append(state.drag.virtual);
}

function resetDragState() {
    state.drag.dragging = false;
    state.drag.elem  = null;
    state.drag.virtual = null;
    state.drag.from = null;
    state.drag.startX = null;
    state.drag.startY = null;
}

function getDropPosition(column, posiY, draggingCard) {
    const columnCards = column.querySelectorAll('.card');

    for (let card of columnCards) {
        if (card == draggingCard) continue;

        const rect = card.getBoundingClientRect();
        const midpoint = (rect.top + rect.bottom) / 2;

        if (posiY < midpoint) {
            return Number(card.dataset.taskId)
        }
    }
    return null;
}

function createSkeletonCard() {
    const skeleton = document.createElement('div');
    skeleton.classList.add('card', 'skeleton');

    const skeletonHead = document.createElement('div')
    const skeletonDetails = document.createElement('div')
    const skeletonAction = document.createElement('div')

    skeletonHead.classList.add('skeleton-top')
    skeletonDetails.classList.add('card-details')
    skeletonAction.classList.add('card-action')

    const skeletonTitle = document.createElement('span')
    const skeletonDesc = document.createElement('span')
    skeletonTitle.classList.add('skeleton-title')
    skeletonDesc.classList.add('skeleton-desc')

    const skeletonBadge = document.createElement('span')
    const skeletonDate = document.createElement('span')
    skeletonBadge.classList.add('skeleton-badge')
    skeletonDate.classList.add('skeleton-date')

    const skeletonBtn = document.createElement('span')
    skeletonBtn.classList.add('skeleton-action')

    skeletonAction.append(skeletonBtn)
    skeletonDetails.append(skeletonBadge, skeletonDate)
    skeletonHead.append(skeletonTitle, skeletonDesc)
    skeleton.append(skeletonHead, skeletonDetails, skeletonAction)
    
    inProgress.append(skeleton)
}