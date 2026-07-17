import { state, } from "./state.js";
import { getStorageData } from "./storage.js";
import { render, createColumnList } from "./render.js";
import { addEventListners } from "./events.js";


function initApp() {
    state.tasks = getStorageData();
    createColumnList();
    render();
    addEventListners();
}

initApp();

