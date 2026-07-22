import { state } from "./state.js"

const priorityOrder = {
    Low:  0,
    Mid:  1,
    High: 2
}

const escapingRegex = /[.*+?^${}()|[\]\\]/g

export function showHighlight(text) {
    let escapedSearch = cleanSearch(state.search)
    let regex = new RegExp(escapedSearch, "gi")
    return text.replace(regex, `<span class="highlighted">$&</span>`)
}

function cleanSearch(rawStr) {
    return rawStr.replace(escapingRegex, `\\$&`);
}

export function sortTasks(t1, t2) {

    switch (state.sortBy) {
        case 'dueDateA': {
            if (t1.dueDate === null && t2.dueDate === null) return 0;
            if (t1.dueDate === null) return 1;
            if (t2.dueDate === null) return -1;

            return t1.dueDate - t2.dueDate;
        } 
        case 'dueDateD': {
            if (t1.dueDate === null && t2.dueDate === null) return 0;
            if (t1.dueDate === null) return -1
            if (t2.dueDate === null) return 1;

            return t2.dueDate - t1.dueDate;
        }
        case 'prioA': return priorityOrder[t1.priority] - priorityOrder[t2.priority];
        case 'prioD': return priorityOrder[t2.priority] - priorityOrder[t1.priority];
        case 'created': return t1.createdAt - t2.createdAt;
    }
}

function filterDateWise(task) {
    let today = new Date().setHours(0, 0, 0, 0);
    let tomorrow = today + 24 * 60 * 60 * 1000;
    let filter = state.filters.date;

    switch (filter) {
        case 'overDue':  {
            if (task.dueDate === null) return false;
            return task.dueDate < today;
        }
        case 'dueToday': return task.dueDate === today;
        case 'dueTomorrow': return task.dueDate === tomorrow;
        case 'upcoming': return task.dueDate > tomorrow;
        case 'noDate': return task.dueDate === null;
    }
}

export function filterTasks(task) {
    let title = task.title.toLowerCase();
    let desc = task.description.toLowerCase();
    let filteredTask = title.includes(state.search) || desc.includes(state.search);

    if (state.filters.priority) {
        filteredTask = filteredTask && task.priority === state.filters.priority;
    }

    if (state.filters.date) {
        filteredTask = filteredTask && filterDateWise(task)
    }
    
    return filteredTask;
}

export function customSort(taskList) {
    const sortedList = [];

    for (const column of ["todo", "inProgress", "completed"]) {
        for (const id of state.columns[column]) {
            const foundTask = taskList.find(task => task.id === id)
            if (foundTask) sortedList.push(foundTask)
        }
    }
    
    return sortedList;
}