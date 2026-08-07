import { taskWindow, track } from "./dom.js";

const index = 0;

function getStep() {
    const cols = taskWindow.querySelectorAll('.column')
    return cols[1].getBoundingClientRect().left - cols[0].getBoundingClientRect().left;
}

function getTranslateLength(index) {
    const step = getStep();
    const padding = parseFloat(getComputedStyle(track).paddingRight);
    const max = track.scrollWidth + padding - taskWindow.clientWidth;

    return Math.min(index * step , max)
}

export function swipeTo(index) {
    const x = getTranslateLength(index)
    track.style.transform = `translateX(-${x}px)`;
}