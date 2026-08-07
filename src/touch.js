import { taskWindow, track } from "./dom.js";

let index = 0;
const touchState = {
    startX: null,
    startY: null,
}


export function manageTouch(e) {
    const touch = e.touches[0];
    if (e.target.closest('.card')) return;
    
    document.addEventListener('touchend', swipeManager)

    touchState.startX = touch.clientX;
    touchState.startY = touch.clientY;
}

function swipeManager(e) {
    const touch = e.changedTouches[0];
    const x = touchState.startX - touch.clientX;
    const y = touchState.startY - touch.clientY;

    const xDistance = Math.abs(x)
    const yDistance = Math.abs(y)

    if (xDistance <= yDistance) return;

    if (x > 12 && index < 2) {
        index++;
        swipe();
    } else if (x < -12 && index > 0) {
        console.log('left')
        index--;
        swipe();
    }
}


function getStep() {
    const cols = taskWindow.querySelectorAll('.column')
    return cols[1].getBoundingClientRect().left - cols[0].getBoundingClientRect().left;
}

function getTranslateLength() {
    const step = getStep();
    const padding = parseFloat(getComputedStyle(track).paddingRight);
    const max = track.scrollWidth + padding - taskWindow.clientWidth;

    return Math.min(index * step , max)
}

function swipe() {
    const x = getTranslateLength(index)
    track.style.transform = `translateX(-${x}px)`;
}

