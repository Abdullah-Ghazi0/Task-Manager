import { taskWindow, track } from "./dom.js";

const touchState = {
    index: 0,
    startX: null,
    startY: null,
    cachedStep: 0,
    cachedMax:  0,
}

export function manageTouch(e) {
    if (e.touches.length > 1) return;
    const touch = e.touches[0];
    if (e.target.closest('.card')) return;
    
    document.addEventListener('touchend', swipeManager)
    document.addEventListener('touchmove', moveTouch)

    touchState.startX = touch.clientX;
    touchState.startY = touch.clientY;
    touchState.cachedStep = getStep();
    touchState.cachedMax = getMax();
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
    const threshold = getStep() * 0.25;

    if (checkVirtical(touch)) return;

    track.classList.add('trans')
    if (x > threshold && touchState.index < 2) {
        touchState.index++;
        swipe();
    } else if (x < -threshold && touchState.index > 0) {
        touchState.index--;
        swipe();
    } else {
        swipe();
    }
    track.addEventListener('transitionend', transRemove, {once: true})
    cleanUp();
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

function cleanUp() {
    touchState.startX = null;
    touchState.startY = null;

    document.removeEventListener('touchend', swipeManager)
    document.removeEventListener('touchmove', moveTouch)
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
    const step = touchState.cachedStep || getStep();
    const max = touchState.cachedMax || getMax();

    return Math.min(touchState.index * step , max)
}

function swipe() {
    const x = getTranslateLength()
    track.style.transform = `translateX(-${x}px)`;
}

function slideTrack(x) {
    const oldLength = getTranslateLength();
    if (x > 0 && touchState.index === 2) return;
    track.style.transform = `translateX(-${oldLength + x}px)`;
}

