import { modal, addBtn, titleField, priorityField, dateField, descField, modalBox, modalHead, newTaskbtn } from "./dom.js";

import { Task } from "./task.js";
import { state } from "./state.js";
import { returnFocus, getNumberDate, trackEvent } from "./utils.js";
import { updateStorage, storeCustomOrder } from "./storage.js";
import { render } from "./render.js"

export function toggleModal() {
    if (state.modal) {
        modal.classList.remove('show');
        state.modal = false;
        resetModal();
        returnFocus(newTaskbtn);
    } else {
        modal.classList.add('show');
        state.modal = true;
        returnFocus(titleField);
    }
}

function resetForm() {
    titleField.value = '';
    addBtn.classList.add('disabled');
    priorityField.value = 'Low';
    dateField.value = '';
    descField.value = '';
}

function getFormData() {
    let title = titleField.value;
    let priority = priorityField.value;
    let date = dateField.value;
    let desc = descField.value;

    if (date) {
        const [y, m, d] = date.split('-').map(Number);
        date = new Date(y, m-1, d).setHours(0, 0, 0, 0);
    } else date = null;

    return {
        title: title,
        priority: priority,
        date: date,
        desc: desc
    }
}

export function createNewTask() {

    const newTask = new Task(getFormData());

    state.tasks.push(newTask);
    state.columns.todo.push(newTask.id);
    updateStorage();
    storeCustomOrder();
    render();
    toggleModal();
    resetForm();
    trackEvent('task_created', {priority : newTask.priority});
}

function resetModal() {
    if (state.editState) {
        modalBox.addEventListener('transitionend', () => {
            state.editState = false;
            editModal();
            resetForm();
        }, {once:true})
    }
}

function editModal() {
    let editState = state.editState;
    modalHead.textContent = editState ? 'Edit Task' : 'Create New Task';
    addBtn.textContent = editState ? 'Save Changes' : 'Create Task';
}

export function editForm(task) {
    editModal();
    titleField.value = task.title;
    descField.value = task.description === 'No Description' ? '' : task.description;
    priorityField.value = task.priority;
    dateField.value = getNumberDate(task.dueDate);

    addBtn.classList.remove('disabled');

    toggleModal();
}

export function saveEditChanges() {

    const newData = getFormData();
    state.taskEditing.editTask(newData);
    state.taskEditing = null;
    updateStorage();
    toggleModal();
    render();
}