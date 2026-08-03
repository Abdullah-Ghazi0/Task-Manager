import { state } from "./state.js";
import { toastBox } from "./dom.js";

export function getIndex(taskToFind) {
    const index = state.tasks.findIndex(task => task.id === taskToFind);
    return index;
}

export function getTaskFromId(id) {
    const taskIndex = getIndex(id);
    return state.tasks[taskIndex]
}

export function returnFocus(elem) {
    requestAnimationFrame(() => {
        requestAnimationFrame(()=> {
            elem.focus();
        })
    })
}

export function getCleanDateStr(date) {
    if (!date) return "No Due Date";
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getNumberDate(ms) {
    if (ms) {
        const date = new Date(ms);

        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");

        return `${y}-${m}-${d}`;
    }
    return null;
}

export function showToast(message) {
    const toast = document.createElement('div')
    toast.textContent = message;
    toast.classList.add('toast')

    toastBox.append(toast)

    requestAnimationFrame(() => {
        toast.classList.add('show')
    })

    setTimeout(() => {
        toast.classList.remove('show')
        setTimeout(() => {
            toast.remove();
        }, 300)
    }, 2500)
}