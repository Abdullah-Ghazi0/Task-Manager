import { state } from "./state.js";
import { getNewId } from "./storage.js";
import { getIndex } from "./utils.js";


export class Task {
    constructor({title, priority, date, desc}) {
        this.id = getNewId();
        this.title = title;
        this.priority = priority;
        this.dueDate = date;
        this.description = desc || "Do the Task!"
        this.status = "todo";
        this.createdAt = Date.now();
    }

    editTask({title, priority, date, desc}) {
        this.title = title;
        this.priority = priority;
        this.dueDate = date;
        this.description = desc || "No Description";
    }

    changeStatus(newStatus) {
        this.status = newStatus;
    }

    rmTask() {
        const column = state.columns[this.status];
        column.splice(column.indexOf(this.id), 1);

        state.tasks.splice(getIndex(this.id), 1);
    }

    static formJSON(data) {
        return Object.assign(Object.create(Task.prototype), data)
    }
}