const input = document.getElementById('selector');
const preElement = document.getElementById('result');

window.addEventListener('load', () => {
    let text = JSON.stringify(categorizeSelector(input.value), null, 2);
    preElement.innerText = text;

    input.setSelectionRange(input.value.length, input.value.length);
    input.focus();
});

input.addEventListener('input', () => {
    let text = JSON.stringify(categorizeSelector(input.value), null, 2);
    preElement.innerText = text;
});