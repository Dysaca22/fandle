const HTML_ELEMENTS = {
    nav_list: document.getElementById("nav-list"),
    nav_template: document.getElementById("nav-template"),
    autocomplete_label: document.getElementById("autocomplete-label"),
};

function setInputAutocompleteLabel() {
    HTML_ELEMENTS.autocomplete_label.textContent = "";
    const label = "The " + window.STATES.actualPage.page + " is";
    [...label].forEach((item, index) => {
        const span = document.createElement("span");
        span.style.transitionDelay = `${(index / (label.length - 1)) * 500}ms`;
        span.textContent = item;
        HTML_ELEMENTS.autocomplete_label.appendChild(span);
    });    const span = document.createElement("span");
    span.classList.add("dots");
    HTML_ELEMENTS.autocomplete_label.appendChild(span);
}

function changePage(input) {
    console.log(input.value);
    input.checked = true;
    document
        .querySelectorAll(".my-game")
        .forEach((e) => e?.classList.add("hidden"));
    document
        .querySelector(`.my-game[game='${input.value}']`)
        ?.classList.remove("hidden");
    window.STATES.actualPage = window.DATA.find(
        (item) => item.page === input.value
    );
    setInputAutocompleteLabel();
}

export function loadNavBar(item, index) {
    const navElement = HTML_ELEMENTS.nav_template.content.cloneNode(true);
    const input = navElement.querySelector("input");
    input.value = item.page;
    navElement.querySelector("[nav-name]").textContent = item.page;
    if (index === 0) {
        changePage(input);
    }
    input.addEventListener("input", (e) => changePage(e.target));
    HTML_ELEMENTS.nav_list.appendChild(navElement);
}