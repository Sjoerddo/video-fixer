const OPTIONS_KEY = 'options';
const InputTypes = { radio: 'value', checkbox: 'checked' };
const ValueTypes = { string: 'value', boolean: 'checked' };

document.addEventListener('DOMContentLoaded', () => {
    const form = document.forms.options;

    form.querySelectorAll('input[type=radio], input[type=checkbox]').forEach((input) => {
        input.addEventListener('click', saveInputTarget);
    });

    Object.entries(getOptions(OPTIONS_KEY)).forEach(([key, value]) => {
        form[key][ValueTypes[typeof value]] = value;
    });
});

const saveInputTarget = ({ target }) => {
    const type = InputTypes[target.type];
    save({ [target.name]: target[type] });
};

const save = (obj) => {
    const options = getOptions(OPTIONS_KEY);

    Object.entries(obj).forEach(([key, value]) => {
        options[key] = value;
    });

    setOptions(OPTIONS_KEY, options);
};

const getOptions = (key) => {
    return JSON.parse(localStorage.getItem(key)) || {};
};

const setOptions = (key, options) => {
    return localStorage.setItem(key, JSON.stringify(options));
};