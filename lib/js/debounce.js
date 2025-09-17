/**
 * Creates a new function that handles calling the provided function. On
 * repeated invocations, the function will not be called intil `time`
 * milliseconds have passed.
 * @param fn The function that will be debounced. The context for the function
 *   is the same as the context of the debounced function.
 * @param time The number of milliseconds that should pass before the function
 *   is called.
 */
export const debounce = (fn, time) => {
    let timeout;
    return function (...args) {
        const functionCall = () => {
            fn.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = window.setTimeout(functionCall, time);
    };
};
