export function isSubclassOf(subClass, superClass) {
    let prototype = Object.getPrototypeOf(subClass.prototype);
    while (prototype) {
        if (prototype === superClass.prototype) {
            return true;
        }
        prototype = Object.getPrototypeOf(prototype);
    }
    return false;
}
export const wait = (fn, time) => (...args) => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(fn(...args)), time);
    });
};
