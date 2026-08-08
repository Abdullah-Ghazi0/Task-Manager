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
    document.addEventListener('touchmove', moveTouch)

    touchState.startX = touch.clientX;
    touchState.startY = touch.clientY;
}

function moveTouch(e) {
    const touch = e.touches[0];
    const move = touchState.startX - touch.clientX;
    
    if (checkVirtical(touch)) return;
    slideTrack(move);
}

function swipeManager(e) {
    const touch = e.changedTouches[0];
    const x = touchState.startX - touch.clientX;

    if (checkVirtical(touch)) return;

    track.classList.add('trans')
    if (x > 12 && index < 2) {
        index++;
        swipe();
    } else if (x < -12 && index > 0) {
        index--;
        swipe();
    }
    track.addEventListener('transitionend', transRemove, {once: true})
}

function transRemove() {
    track.classList.remove('trans')
}

function checkVirtical(touch) {
    const x = touchState.startX - touch.clientX;
    const y = touchState.startY - touch.clientY;

    const xDistance = Math.abs(x)
    const yDistance = Math.abs(y)

    if (xDistance <= yDistance) {
        return true;
    } else {
        return false;
    }
}

function getStep() {
    const cols = taskWindow.querySelectorAll('.column')
    return cols[1].getBoundingClientRect().left - cols[0].getBoundingClientRect().left;
}

function getMax() {
    const padding = parseFloat(getComputedStyle(track).paddingRight);
    return track.scrollWidth + padding - taskWindow.clientWidth;
}

function getTranslateLength() {
    const step = getStep();
    const max = getMax()

    return Math.min(index * step , max)
}

function swipe() {
    const x = getTranslateLength()
    track.style.transform = `translateX(-${x}px)`;
}

function slideTrack(x) {
    const oldLength = getTranslateLength();
    if (x > 0 && index === 2) return;
    track.style.transform = `translateX(-${oldLength + x}px)`;
}

