import { state, changeTaskColumn } from "./state.js";
import { getTaskFromId, showToast } from "./utils.js";
import { render } from "./render.js";
import { storeCustomOrder, updateStorage } from "./storage.js";
import { touchCleanUp, swipeLeft, swipeRight } from "./touch.js";

import { inProgress } from "./dom.js";

export function dragStart(e) {
    if (e.target.closest('button')) return;
    if (e.target.closest('select')) return;

    const card = e.target.closest('.card')
    if (!card) return

    if (e.pointerType === 'touch') {
        document.addEventListener('touchmove', touchMoveHandler, { passive: false });
        touchManager();
    }
    state.drag.elem = card;
    state.drag.from = card.parentElement.id;

    const rect = card.getBoundingClientRect()
    state.drag.startX = e.clientX;
    state.drag.startY = e.clientY;
    state.drag.offsetX = e.clientX - rect.left;
    state.drag.offsetY = e.clientY - rect.top;
    state.drag.width = window.innerWidth;

    document.body.classList.add('no-select');
    document.addEventListener('pointermove', dragMove);
    document.addEventListener('pointerup', dragEnd);
    document.addEventListener('pointercancel', dragEnd);
}

function dragMove(e) {
    const dx = e.clientX - state.drag.startX;
    const dy = e.clientY - state.drag.startY;

    if (!state.drag.dragging) {
        if (Math.hypot(dx, dy) < 8) return;
        if (!state.drag.ready) {
            clearTimeout(state.drag.timer)
            return;
        }
        initDragging();
    }
    
    autoSwipeHandler(e.clientX)

    state.drag.virtual.style.left = `${e.clientX - state.drag.offsetX}px`;
    state.drag.virtual.style.top = `${e.clientY - state.drag.offsetY}px`;
    showPlaceholder(e.clientX, e.clientY)
}

function dragEnd(e) {
    document.removeEventListener('pointermove', dragMove);
    document.removeEventListener('pointerup', dragEnd);
    document.removeEventListener('pointercancel', dragEnd);
    document.removeEventListener('touchmove', touchMoveHandler);

    document.body.classList.remove('no-select');

    const newColumn = getCurrentColumn(e.clientX, e.clientY);
    removePlaceholder();
    if (!state.drag.dragging) {
        resetDragState();
        return;   
    }

    if (newColumn) {
        changeStatusOnDrag(newColumn, e.clientY);
    }

    state.drag.virtual?.remove();
    state.drag.elem.classList.remove('dim-card', 'dragging');
    state.drag.elem.style.touchAction = '';
    resetDragState();
}

function changeStatusOnDrag(newColumn, cordsY) {
    const newStatus = newColumn.id;
    const draggingTaskId = Number(state.drag.elem.dataset.taskId)

    const task = getTaskFromId(draggingTaskId)
    const oldStatus = task.status;
    task.changeStatus(newStatus)

    const insertBefore = getDropPosition(newColumn, cordsY, state.drag.elem)
    if (state.sortBy !== '') {
        if (oldStatus === newStatus) {
            showToast('Order can be changed in Sort by: Custom')
            return;
        }
            
        changeTaskColumn(state.drag.from, newStatus, draggingTaskId);
        showToast('Status changed, order can be changed in Sort by: Custom')
    } else {
        changeTaskColumn(state.drag.from, newStatus, draggingTaskId, insertBefore);
    }
    
    storeCustomOrder();
    updateStorage();
    render();
}

function initDragging() {
    state.drag.dragging = true;

    state.drag.elem.style.touchAction = 'none';
    state.drag.elem.classList.add('dim-card', 'dragging')
    
    state.drag.virtual = state.drag.elem.cloneNode(true);
    state.drag.virtual.classList.add('virtual-card')

    document.body.append(state.drag.virtual);
}

function touchManager() {
    state.drag.ready = false;
    state.drag.timer = setTimeout(() => {
        state.drag.ready = true;
        touchCleanUp();
    }, 320)
}

function resetDragState() {
    if (state.drag.swipeTimer) {
        clearTimeout(state.drag.swipeTimer)
    }

    state.drag.dragging = false;
    state.drag.elem  = null;
    state.drag.virtual = null;
    state.drag.from = null;
    state.drag.startX = null;
    state.drag.startY = null;
    state.drag.offsetX = null;
    state.drag.offsetY = null;
    state.drag.swipeTimer = null;
    state.drag.currentX = null;
    state.drag.scroll = false;
    state.drag.scrollColumn = null;
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

function getCurrentColumn(xPosi, yPosi) {
    const elem = document.elementFromPoint(xPosi, yPosi);
    return elem?.closest('.taskList');
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
    
    return skeleton;
}

function removePlaceholder() {
    const oldSkeleton = document.querySelector('.skeleton')
    if (oldSkeleton) {
        oldSkeleton.remove()
    } 
}

function showPlaceholder(xPosi, yPosi) {
    removePlaceholder();
    const onColumn = getCurrentColumn(xPosi, yPosi);
    if (!onColumn) return;

    autoScrollHandler(onColumn, yPosi)
    const taskId = getDropPosition(onColumn, yPosi, state.drag.elem)
    const insertBefore = onColumn.querySelector(`[data-task-id="${taskId}"]`)
    loadMoreOnDrag(onColumn, insertBefore);

    const placeholder = createSkeletonCard()
    if (onColumn.classList.contains('empty')) {
        onColumn.prepend(placeholder)
    } else if (insertBefore) {
        if (insertBefore.previousElementSibling == state.drag.elem) return;
        insertBefore.before(placeholder);
    }else {
        if (onColumn.lastElementChild == state.drag.elem) return;
        onColumn.append(placeholder)
    }
}

function loadMoreOnDrag(column, insertBefore) {
    const haveMore = column.lastElementChild.classList.contains('loadMore');
    // const onLoadBtn = insertBefore.classList.contains('loadMore');
    if (!insertBefore && haveMore) {
        state.listLength[column.id] += 10;
        render();
    }
}

function touchMoveHandler(e) {
    if (state.drag.dragging) {
        e.preventDefault();
    }
}

function autoSwipeHandler(x) {
    state.drag.currentX = x;

    if (state.drag.swipeTimer) return;
    
    const totalWidth = state.drag.width;
    const leftLimit = totalWidth * 0.15;
    const rightLimit = totalWidth - leftLimit;

    if (x < leftLimit || x > rightLimit) {
        
        state.drag.swipeTimer = setTimeout(autoSwipe, 600)
    }
}

function autoSwipe() {
    const totalWidth = state.drag.width;
    const leftLimit = totalWidth * 0.15;
    const rightLimit = totalWidth - leftLimit;

    if (state.drag.currentX < leftLimit) {
        swipeLeft()
    } else if (state.drag.currentX > rightLimit) {
        swipeRight()
    }
    swipeCleanUp();
}

function swipeCleanUp() {
    state.drag.swipeTimer = null;
    state.drag.currentX = null;
}

function autoScrollHandler(column, y) {
    const {colTop, colBottom, upperLimit, lowerLimit} = getColumnRect(column);
    
    if (y > lowerLimit && y < colBottom) {
        state.drag.scrollColumn = column;
        state.drag.scroll = true;

        if (state.drag.scrollFrame) return;
        scrollDown()
    } else if (y < upperLimit && y > colTop) {
        state.drag.scrollColumn = column;
        state.drag.scroll = true;

        if (state.drag.scrollFrame) return;
        scrollUp()
    } else {
        state.drag.scroll = false;
    }

}

function getColumnRect(column) {
    const col = column.getBoundingClientRect();
    const colLimit = col.height * 0.15;
    const colTop = col.top;
    const colBottom = col.bottom;
    return {
        colTop : colTop,
        colBottom : colBottom,
        upperLimit : colTop + colLimit,
        lowerLimit : colBottom - colLimit,
    }

}

function scrollDown() {
    if (state.drag.scroll === false) {
        state.drag.scrollFrame = null;
        return;
    }
    state.drag.scrollColumn.scrollTop += 5;
    state.drag.scrollFrame = requestAnimationFrame(scrollDown);
}

function scrollUp() {
    if (state.drag.scroll === false) {
        state.drag.scrollFrame = null;
        return;
    }
    state.drag.scrollColumn.scrollTop -= 5;
    state.drag.scrollFrame = requestAnimationFrame(scrollUp);
}