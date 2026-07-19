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
        completed: []

    },
    listLength: {todo: 10, inProgress: 10, completed: 10},
    drag: {
        dragging: false,
        elem : null,
        virtual: null,
        from: null,
        startX: null,
        startY: null,
    }
}

export function changeTaskColumn(from, to, id) {
    from = state.columns[from];
    to = state.columns[to];

    from.splice(from.indexOf(id), 1);
    to.push(id);
}