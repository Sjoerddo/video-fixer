const OPTIONS_KEY = 'options';
const Form = document.forms.options;

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('input[type="radio"][name="alignment"]').forEach((alignment) => {
        alignment.addEventListener('click', ({ target }) => {
            save({ alignment: target.value });
        });
    });

    document.getElementById('close-after-ending').addEventListener('click', ({ target }) => {
        save({ closeAfterEnding: target.checked });
    });

    const storedOptions = getStored(OPTIONS_KEY);

    Object.keys(storedOptions).forEach((key) => {
        const value = storedOptions[key];
        const valueType = typeof value === 'boolean' ? 'checked' : 'value';
        Form[key][valueType] = value;
    });
});

function save(obj) {
    if (obj === undefined || obj === null) return;

    let options = getStored(OPTIONS_KEY) || {},
        keys = Object.keys(options);

    if (keys.length === 0) {
        options = obj;
    } else {
        Object.keys(obj).forEach((key) => {
            options[key] = obj[key];
        });
    }

    setStored(OPTIONS_KEY, options);
}

function getStored(key) {
    return JSON.parse(localStorage.getItem(key));
}

function setStored(key, obj) {
    localStorage.setItem(key, JSON.stringify(obj));
}