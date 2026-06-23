const container = document.querySelector(".container")

const newTaskbtn = document.querySelector('#newTaskBtn')

const form = document.querySelector('form')
const titleField = document.querySelector("#title")
const priorityField = document.querySelector("#priority")
const dateField = document.querySelector("#dueDate")
const descField = document.querySelector("#description")
const addBtn = document.querySelector("#addTask")

const todo = document.querySelector("#todo");
const inProgrss = document.querySelector("#doing");
const completed = document.querySelector("#done");

const template = document.querySelector("template")

const closeBtn = document.querySelector('.close')
const modal = document.querySelector('.modal-overlay')

let id = 0;
let state = {
    tasks: [],
    modal: modal.classList.contains('show'),
}

class Task {
    constructor({title, priority, date, desc}) {
        this.id = getNewId();
        this.title = title;
        this.priority = priority;
        this.date = date || "No Due Date";
        this.description = desc || "Do the Task!"
        this.status = "todo";
    }

    changeStatus(newStatus) {
        this.status = newStatus;
    }

    rmTask() {
    const removedTask = state.tasks.splice(getIndex(this), 1);
}
}

function getNewId() {
    id++;
    return id;
}

function getIndex(taskToFind) {
    const index = state.tasks.findIndex(task => task.id === taskToFind.id);
    return index;
}

function render() {
    todo.innerHTML = '';
    inProgrss.innerHTML = '';
    completed.innerHTML = '';

    state.tasks.forEach((task)=> {

        const clone = template.content.cloneNode("true")

        const title =  clone.querySelector('h3');
        const desc = clone.querySelector('p');
        const status = clone.querySelector('select');
        const rm = clone.querySelector('button');
        const prio = clone.querySelector('.prio');
        const date = clone.querySelector('span');

        title.textContent = task.title;
        desc.textContent = task.description;
        status.value = task.status;
        prio.textContent = task.priority;
        date.textContent = task.date;

        const priorityClass = {"Low":'prio-low', "Mid":'prio-mid', "High":'prio-high'}
        prio.classList.add(priorityClass[task.priority])
        
        status.addEventListener("change", (e)=> {
            task.changeStatus(e.target.value);
            render();
        })

        rm.addEventListener("click", ()=> {
            task.rmTask();
            render();
        })

        if (task.status === 'todo') {
            todo.appendChild(clone);
        } else if (task.status === 'doing') {
            inProgrss.appendChild(clone);
        } else if (task.status === 'done') {
            completed.appendChild(clone);
        }
    })
}
function resetForm() {
    titleField.value = '';
    addBtn.classList.add('disabled')
    priorityField.value = 'Low';
    dateField.value = ''
    descField.value = ''
}

function getFormData() {
    let title = titleField.value;
    let priority = priorityField.value;
    let date = dateField.value;
    let desc = descField.value;

    if (date) {
        date = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    return {
        title: title,
        priority: priority,
        date: date,
        desc: desc
    }
}

function createNewTask() {

    const newTask = new Task(getFormData());
    state.tasks.push(newTask);
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