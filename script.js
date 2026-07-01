const container = document.querySelector(".container")

const newTaskbtn = document.querySelector('#newTaskBtn')

const form = document.querySelector('form')
const titleField = document.querySelector("#title")
const priorityField = document.querySelector("#priority")
const dateField = document.querySelector("#dueDate")
const descField = document.querySelector("#description")
const addBtn = document.querySelector("#addTask")

const todo = document.querySelector("#todo");
const inProgress = document.querySelector("#inProgress");
const completed = document.querySelector("#completed");

const todoCountBox = document.querySelector("#todoCount");
const doingCountBox = document.querySelector("#doingCount");
const doneCountBox = document.querySelector("#doneCount");

const template = document.querySelector("template");

const closeBtn = document.querySelector('.close');
const modal = document.querySelector('.modal-overlay');

const searchBar = document.querySelector('#searchField');
const dateFilter = document.querySelector("#dateFilter");
const prioFilter = document.querySelector("#priorityFilter");
const sortFilter = document.querySelector('#sort');

const priorityOrder = {
    Low:  0,
    Mid:  1,
    High: 2
}

const priorityClass = {"Low":'prio-low', "Mid":'prio-mid', "High":'prio-high'}

class Task {
    constructor({title, priority, date, desc}) {
        this.id = id++;
        this.title = title;
        this.priority = priority;
        this.date = date;
        this.description = desc || "Do the Task!"
        this.status = "todo";
    }

    changeStatus(newStatus) {
        let oldStatus = this.status; 
        this.status = newStatus;
        changeTaskColumn(oldStatus, newStatus, this.id)
        updateStorage()
    }

    rmTask() {
        const column = state.columns[this.status];
        column.splice(column.indexOf(this.id), 1);

        const removedTask = state.tasks.splice(getIndex(this), 1);
        updateStorage()
    }

    static formJSON(data) {
        return Object.assign(Object.create(Task.prototype), data)
    }
}

let state = {
    tasks: getStorageData(),
    modal: modal.classList.contains('show'),
    search: '',
    filters: {date: null, priority: null},
    sortBy: '', 
    columns: {
        todo: [],
        inProgress: [],
        completed: []

    },
    listLength: {todo: 10, inProgress: 10, completed: 10}
}

function changeTaskColumn(from, to, id) {
    from = state.columns[from];
    to = state.columns[to];

    from.splice(from.indexOf(id), 1);
    to.push(id);
}

let id = getLastId();

function getStorageData() {
    let rawTasks = JSON.parse(localStorage.getItem('tasks'));
    if (!rawTasks) return []
    return rawTasks.map(data => Task.formJSON(data));
}

function createColumnList() {
    for (const task of state.tasks) {
        state.columns[task.status].push(task.id)
    }
}

function getLastId() {
    let lastTask = state.tasks.at(-1);
    return (lastTask?.id ?? 0) + 1;
}

function getIndex(taskToFind) {
    const index = state.tasks.findIndex(task => task.id === taskToFind.id);
    return index;
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

function getCleanDateStr(date) {
    if (!date) return "No Due Date";
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function filterDateWise(task) {
    let today = new Date().setHours(0,0,0,0);
    let tomorrow = today + 24 * 60 * 60 * 1000;
    let filter = state.filters.date;

    switch (filter) {
        case 'overDue':  {
            if (task.date === null) return false;
            return task.date < today;
        }
        case 'dueToday': return task.date === today;
        case 'dueTomorrow': return task.date === tomorrow;
        case 'upcoming': return task.date > tomorrow;
        case 'noDate': return task.date === null;
    }
}

function filterTasks(task) {
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

function sortTasks(t1, t2) {

    switch (state.sortBy) {
        case 'dueDateA': {
            if (t1.date === null && t2.date === null) return 0;
            if (t1.date === null) return 1;
            if (t2.date === null) return -1;

            return t1.date - t2.date;
        } 
        case 'dueDateD': {
            if (t1.date === null && t2.date === null) return 0;
            if (t1.date === null) return -1
            if (t2.date === null) return 1;

            return t2.date - t1.date;
        }
        case 'prioA': return priorityOrder[t1.priority] - priorityOrder[t2.priority];
        case 'prioD': return priorityOrder[t2.priority] - priorityOrder[t1.priority];
    }
}

function getTasks() {
    const currentTasks = state.tasks.filter(filterTasks);
    const sortedTasks =  currentTasks.toSorted(sortTasks);
    return sortedTasks;
}

function showHighlight(text) {
    let escapedSearch = cleanSearch(state.search)
    let regex = new RegExp(escapedSearch, "gi")
    return text.replace(regex, `<span class="highlighted">$&</span>`)
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

function createTaskCard(task) {
    const clone = template.content.cloneNode("true")

        const title =  clone.querySelector('h3');
        const desc = clone.querySelector('p');
        const status = clone.querySelector('select');
        const rm = clone.querySelector('button');
        const prio = clone.querySelector('.prio');
        const date = clone.querySelector('span');

        let titleStr = task.title;
        let descStr = task.description;
        let dateStr = getCleanDateStr(task.date);

        if (state.search) {
            titleStr = showHighlight(titleStr);
            descStr = showHighlight(descStr);
        }

        title.innerHTML = titleStr;
        desc.innerHTML = descStr;
        status.value = task.status;
        prio.textContent = task.priority;
        date.textContent = dateStr;

        prio.classList.add(priorityClass[task.priority]);
        
        status.addEventListener("change", e => {
            task.changeStatus(e.target.value);
            render();
        })

        rm.addEventListener("click", ()=> {
            task.rmTask();
            render();
        })

        addCardToColumn(task, clone)
}

function render() {
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

    checkEmptyColumns()
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

function updateStorage() {
    const taskStr = JSON.stringify(state.tasks)
    localStorage.setItem('tasks', taskStr)
}

function createNewTask() {

    const newTask = new Task(getFormData());

    state.tasks.push(newTask);
    state.columns.todo.push(newTask.id);
    updateStorage();
    render();
    toggleModal();
    resetForm();
}

function returnFocus(elem) {
    requestAnimationFrame(()=> {
        requestAnimationFrame(()=> {
            elem.focus();
        })
    })
}

function toggleModal() {
    if (state.modal) {
        modal.classList.remove('show');
        state.modal = false;
        returnFocus(newTaskbtn);
    } else {
        modal.classList.add('show');
        state.modal = true;
        returnFocus(titleField);
    }
}

function cleanSearch(rawStr) {
    let escapingRegex = /[.*+?^${}()|[\]\\]/g
    return rawStr.replace(escapingRegex, `\\$&`);
}

addBtn.addEventListener('click', e => {
    if (!addBtn.classList.contains("disabled")) createNewTask();
})

window.addEventListener('keydown', e => {
    if (e.key !== "Enter") return;
    if (!state.modal) return;
    if (addBtn.classList.contains("disabled")) return;
    createNewTask();
})

titleField.addEventListener('input', ()=> {
    if (titleField.value !== '') {
        addBtn.classList.remove("disabled")
    } else {
        addBtn.classList.add("disabled")
    }
    
})

form.addEventListener('submit', e => {
    e.preventDefault();
})

closeBtn.addEventListener("click", toggleModal)

newTaskbtn.addEventListener("click", toggleModal)

modal.addEventListener('click', (e)=> {
    if (e.target === modal) {
        toggleModal();
    }
})

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.modal) toggleModal();
})

searchBar.addEventListener('input', e => {
    let searchQuery = searchBar.value;
    state.search = searchQuery.toLowerCase()
    render();
})

dateFilter.addEventListener('change', e => {
    state.filters.date = dateFilter.value;
    render();
})

prioFilter.addEventListener('change', e => {
    state.filters.priority = prioFilter.value;
    render();
})

sortFilter.addEventListener('change', e => {
    state.sortBy = sortFilter.value;
    render();
})

createColumnList()
render();