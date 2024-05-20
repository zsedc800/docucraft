"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createElement(tag, options, ...children) {
    const dom = document.createElement(tag);
    for (const key of Object.keys(options)) {
        const val = options[key];
        if (typeof val === 'function') {
            dom.addEventListener(key.replace('on', ''), val);
        }
        else {
            dom.setAttribute(key, val + '');
        }
    }
    const fragment = document.createDocumentFragment();
    for (const child of children) {
        fragment.append(child);
    }
    dom.appendChild(fragment);
    return dom;
}
exports.default = createElement;
