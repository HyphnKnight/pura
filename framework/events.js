const events = new Map();
export const attachEvent = (el, type, func) => {
    let typeMap = events.get(type);
    if (!typeMap) {
        typeMap = new Map();
        events.set(type, typeMap);
        document.body.addEventListener(type, (event) => {
            const callback = typeMap.get(event.target);
            if (callback)
                callback(event);
        });
    }
    typeMap.set(el, func);
};
export const auditEvents = (parent = document.body) => events.forEach((eventMap) => eventMap.forEach((_, el) => !parent.contains(el) && eventMap.delete(el)));
