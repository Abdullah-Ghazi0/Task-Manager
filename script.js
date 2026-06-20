const container = document.querySelector(".container")

const newTaskbtn = document.querySelector('#newTaskBtn')

const form = document.querySelector('form')
const title = document.querySelector("#title")
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
    constructor(text) {
        this.id = getNewId();
        this.title = text;
        this.description = "Do the Task!"
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

        title.textContent = task.title;
        desc.textContent = task.description;
        status.value = task.status;
        
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
function cleanForm() {
    title.value = '';
    addBtn.classList.add('disabled')
}

function createNewTask() {
    let taskName = title.value;
    if (!taskName) return;

    const newTask = new Task(taskName);
    state.tasks.push(newTask);
    render();
    toggleModal();
    cleanForm();
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
        returnFocus(title);
    }
}

addBtn.addEventListener('click', createNewTask)
window.addEventListener('keydown', e => {
    if (e.key === "Enter" && state.modal) createNewTask();
})

title.addEventListener('input', ()=> {
    if (title.value !== '') {
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