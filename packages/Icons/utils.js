export function classnames(...args) {
    return args
        .filter(Boolean)
        .map((item) => {
        if (typeof item === 'string')
            return item;
        return Object.keys(item)
            .filter((key) => !!item[key])
            .join(' ');
    })
        .join(' ');
}
