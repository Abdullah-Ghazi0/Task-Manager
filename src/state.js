import { modal } from "./dom.js";

export const state = {
    tasks: [],
    modal: modal.classList.contains('show'),
    editState: false,
    taskEditing: null,
    search: '',
    filters: {date: null, priority: null},
    sortBy: '', 
    columns: {
        todo: [],
        inProgress: [],
        completed: [],
    },
    listLength: {todo: 10, inProgress: 10, completed: 10},
    drag: {
        ready: true,
        timer: null,
        dragging: false,
        elem : null,
        virtual: null,
        from: null,
        startX: null,
        startY: null,
        offsetX: null,
        offsetY: null,
        width: 0,
        swipeTimer: null,
        currentX: null,
    }
}

export function changeTaskColumn(from, to, id, insertBefore = null) {
    from = state.columns[from];
    to = state.columns[to];

    from.splice(from.indexOf(id), 1);
    
    if (insertBefore !== null) {
        to.splice(to.indexOf(insertBefore), 0, id)
    } else {
        to.push(id);
    }
}