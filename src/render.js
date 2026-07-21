import { template, todo, inProgress, completed, todoCountBox, doingCountBox, doneCountBox } from "./dom.js";

import { state, changeTaskColumn } from "./state.js";
import { updateStorage } from "./storage.js";
import { editForm } from "./modal.js";
import { getCleanDateStr } from "./utils.js";
import { filterTasks, sortTasks, showHighlight } from "./filter.js";

const priorityClass = {"Low":'prio-low', "Mid":'prio-mid', "High":'prio-high'}

export function render() {
    todo.innerHTML = '';
    inProgress.innerHTML = '';
    completed.innerHTML = '';

    const taskToRender = getTasks();

    taskToRender.forEach(task => {

        createTaskCard(task);
    })

    taskCounts(todo, todoCountBox);
    taskCounts(inProgress, doingCountBox);
    taskCounts(completed, doneCountBox);

    addLoadMore();

    checkEmptyColumns();
}

function getClone() {
    const clone = template.content.cloneNode("true")

    return {
        clone : clone,
        title :  clone.querySelector('h3'),
        desc : clone.querySelector('p'),
        status : clone.querySelector('select'),
        rm : clone.querySelector('.card-delete'),
        edit : clone.querySelector('.card-edit'),
        prio : clone.querySelector('.prio'),
        date : clone.querySelector('.card-date'),
        created : clone.querySelector('.created-at'),

        card : clone.querySelector('.card'),
        cancel : clone.querySelector('.cancel-del'),
        confDel : clone.querySelector('.confirm-del')
    }
    
}

function addEventsToCard(task, card, status, edit, rm, cancel, confDel) {

    status.addEventListener("change", e => {
        let oldStatus = task.status;
        task.changeStatus(e.target.value);
        changeTaskColumn(oldStatus, e.target.value, task.id);
        updateStorage();
        render();
    })

    edit.addEventListener('click', () => {
        state.editState = true;
        state.taskEditing = task;
        editForm(task);
    })

    rm.addEventListener("click", () => card.classList.add('confirmation'))
    cancel.addEventListener("click", () => card.classList.remove('confirmation'))
    confDel.addEventListener("click", () => {
        task.rmTask();
        updateStorage();
        render();
    })

    card.addEventListener('click', e => {
        if (e.target.closest('button')) return;
        if (e.target.closest('select')) return;
            
        const previousExpanded = document.querySelector('.expanded');
        if (previousExpanded) previousExpanded.classList.remove('expanded');
                
        if (previousExpanded !== card) card.classList.add('expanded');
    })
}

function createTaskCard(task) {

    const {clone, title, desc, status, rm, edit, prio, date, created, card, cancel, confDel} = getClone();

    let titleStr = task.title;
    let descStr = task.description;
    let dateStr = getCleanDateStr(task.dueDate);
    let createdDate = getCleanDateStr(task.createdAt);

    if (state.search) {
        titleStr = showHighlight(titleStr);
        descStr = showHighlight(descStr);
    }

    title.innerHTML = titleStr;
    desc.innerHTML = descStr;
    status.value = task.status;
    prio.textContent = task.priority;
    created.textContent = `Created : ${createdDate}`;
    date.textContent = dateStr;

    prio.classList.add(priorityClass[task.priority]);
    card.dataset.taskId = task.id;

    addEventsToCard(task, card, status, edit, rm, cancel, confDel);
        
    addCardToColumn(task, clone);
}

function createLoadBtn(column) {
    const loadBtn = document.createElement('button');
    loadBtn.classList.add('loadMore');
    loadBtn.textContent = "Load More";

    loadBtn.addEventListener('click', e => {
        state.listLength[column.id] += 10;
        render();
    })
    column.appendChild(loadBtn);
}

function addLoadMore() {
    if (state.columns.todo.length > state.listLength.todo) createLoadBtn(todo);
    if (state.columns.inProgress.length > state.listLength.inProgress) createLoadBtn(inProgress);
    if (state.columns.completed.length > state.listLength.completed) createLoadBtn(completed);
}

function addCardToColumn(task, clone) {
    if (task.status === 'todo' && todo.children.length < state.listLength.todo) {
        todo.appendChild(clone);
    } else if (task.status === 'inProgress' && inProgress.children.length < state.listLength.inProgress) {
        inProgress.appendChild(clone);
    } else if (task.status === 'completed' && completed.children.length < state.listLength.completed) {
        completed.appendChild(clone);
    }
}

function getTasks() {
    const currentTasks = state.tasks.filter(filterTasks);
    let sortedTasks;
    if (state.sortBy !== 'custom') {
        sortedTasks =  currentTasks.toSorted(sortTasks);
    }
    return sortedTasks;
}

function taskCounts(column, countBox) {
    if (column.children.length) {
        countBox.textContent = `(${state.columns[column.id].length})`
    } else {
        countBox.textContent = '';
    }
}

function checkEmptyColumns() {
    showEmptyColumn(todo);
    showEmptyColumn(inProgress);
    showEmptyColumn(completed);
}

function showEmptyColumn(column) {
    if (column.children.length <= 0) {
        column.classList.add('empty');
        column.textContent = 'No tasks yet'
    } else {
        column.classList.remove('empty');
    }
}

export function createColumnList() {
    for (const task of state.tasks) {
        state.columns[task.status].push(task.id)
    }
}