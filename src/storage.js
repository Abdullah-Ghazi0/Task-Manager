import { state } from "./state.js";
import { Task } from "./task.js";

let id;

export function getNewId() {
    if (!id) id = getLastId();
    return id++;
}

function getLastId() {
    let lastTask = state.tasks.at(-1);
    return (lastTask?.id ?? 0) + 1;
}

export function getStorageData() {
    let rawTasks = JSON.parse(localStorage.getItem('tasks'));
    if (!rawTasks) return []
    return rawTasks.map(data => Task.formJSON(data));
}

export function updateStorage() {
    const taskStr = JSON.stringify(state.tasks)
    localStorage.setItem('tasks', taskStr)
}

