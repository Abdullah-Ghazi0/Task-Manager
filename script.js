const container = document.querySelector(".container")
const input = document.querySelector("input")
const addBtn = document.querySelector("button")

const todo = document.querySelector("#todo");
const inProgrss = document.querySelector("#doing");
const completed = document.querySelector("#done");

const tasks = []

addBtn.addEventListener('click', e => {
    const newTask = {
        id: tasks.length + 1,
        text: input.value,
        status: "todo"
    }
    tasks.push(newTask)
    renderUi();
})

function renderUi() {
    todo.innerHTML = '';

    tasks.forEach((task)=> {
        const taskElem = document.createElement('div');
        const changeStatus = document.createElement('button');
        const rmTasks = document.createElement('button');

        changeStatus.textContent = "Change Staus";
        rmTasks.textContent = "Delete";

        taskElem.textContent = task.text;
        taskElem.append(changeStatus, rmTasks)

        todo.append(taskElem);
    })
}