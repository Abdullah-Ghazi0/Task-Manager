const container = document.querySelector(".container")
const input = document.querySelector("input")
const addBtn = document.querySelector("button")

const todo = document.querySelector("#todo");
const inProgrss = document.querySelector("#doing");
const completed = document.querySelector("#done");

const template = document.querySelector("template")

let id = 0;
const tasks = []

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
    const removedTask = tasks.splice(getIndex(this), 1);
}
}

function getNewId() {
    id++;
    return id;
}

function getIndex(taskToFind) {
    const index = tasks.findIndex(task => task.id === taskToFind.id);
    return index;
}

function render() {
    todo.innerHTML = '';
    inProgrss.innerHTML = '';
    completed.innerHTML = '';

    tasks.forEach((task)=> {

        const clone = template.content.cloneNode("true")

        const title =  clone.querySelector('h3');
        const desc = clone.querySelector('p');
        const status = clone.querySelector('select');
        const rm = clone.querySelector('button');

        title.textContent = task.title;
        desc.textContent = task.description;
        status.value = task.status;
        
        status.addEventListener("change", (e)=> {
            task.status = e.target.value;
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

function createNewTask() {
    let taskName = input.value;
    if (!taskName) return;

    const newTask = new Task(taskName);
    tasks.push(newTask);
    render();

    input.value = '';
}

addBtn.addEventListener('click', createNewTask)
window.addEventListener('keydown', e => {
    if (e.key === "Enter") createNewTask();
})