const input = document.getElementById("selector");
const preElement = document.getElementById("result");
const copyButtons = document.querySelectorAll(".copy-button");
const copiedText = document.getElementById("copied");

window.addEventListener("load", () => {
  let text = JSON.stringify(categorizeSelector(input.value), null, 2);
  preElement.innerText = text;

  input.setSelectionRange(input.value.length, input.value.length);
  input.focus();

  copyButtons.forEach((button) => {
    let relatedPre = button.parentElement.querySelector("pre");

    button.addEventListener("click", () => {
      let input = document.createElement("input");
      input.value = relatedPre.innerText;

      document.body.appendChild(input);

      input.select();
      input.setSelectionRange(0, 99999);
      navigator.clipboard.writeText(input.value);

      input.remove();
    });
  });
});

input.addEventListener("input", () => {
  let text = JSON.stringify(categorizeSelector(input.value), null, 2);
  preElement.innerText = text;
});
