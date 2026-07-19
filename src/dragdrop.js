import { state } from "./state.js";
import { getTaskFromId } from "./utils.js";
import { changeTaskColumn } from "./state.js";
import { render } from "./render.js";

export function dragStart(e) {
    if (e.target.closest('button')) return;
    if (e.target.closest('select')) return;

    const card = e.target.closest('.card')
    if (!card) return

    state.drag.elem = card;
    state.drag.from = card.parentElement.id;

    document.body.classList.add('no-select')
    document.addEventListener('pointermove', dragMove);
    document.addEventListener('pointerup', dragEnd);
}

function dragMove(e) {
    state.drag.posiX = e.clientX;
    state.drag.posiY = e.clientY;
}

function dragEnd(e) {
    document.removeEventListener('pointermove', dragMove);
    document.removeEventListener('pointerup', dragEnd);
    document.body.classList.add('no-select')
    
    const newColumn = document.elementFromPoint(state.drag.posiX, state.drag.posiY);
    changeStatusOnDrag(newColumn);
}

function changeStatusOnDrag(newColumn) {
    const newStatus = newColumn.id;
    const draggingTaskId = Number(state.drag.elem.dataset.taskId)

    const task = getTaskFromId(draggingTaskId)
    task.changeStatus(newStatus)
    changeTaskColumn(state.drag.from, newStatus, draggingTaskId);

    render();
}