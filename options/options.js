const OPTIONS_KEY = 'options';
const Form = document.forms.options;
const InputTypes = { radio: 'value', checkbox: 'checked' };
const ValueTypes = { string: 'value', boolean: 'checked' };

document.addEventListener('DOMContentLoaded', () => {
    addEvent('input[type="radio"][name="alignment"]', ['click', saveInputTarget]);
    addEvent('#close-after-ending', ['click', saveInputTarget]);

    const options = getOptions(OPTIONS_KEY) || {};
    Object.entries(options).forEach(([key, value]) => {
        Form[key][ValueTypes[typeof value]] = value;
    });
});

const addEvent = (selector, [name, listener]) => {
    const elements = document.querySelectorAll(selector);

    elements.forEach((element) => {
        element.addEventListener(name, listener);
    });
};

const saveInputTarget = ({ target }) => {
    const type = InputTypes[target.type];
    save({ [target.name]: target[type] });
};

const save = (obj) => {
    const options = getOptions(OPTIONS_KEY) || {};

    Object.entries(obj).forEach(([key, value]) => {
        options[key] = value;
    });

    setOptions(OPTIONS_KEY, options);
};

const getOptions = (key) => {
    return JSON.parse(localStorage.getItem(key));
};

const setOptions = (key, options) => {
    return localStorage.setItem(key, JSON.stringify(options));
};