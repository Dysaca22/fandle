import { setElementGameList } from "./game-list.js";

const HTML_ELEMENTS = {
    autocomplete_wrapper: document.getElementById("autocomplete-wrapper"),
    autocomplete_input: document.getElementById("autocomplete-input"),
    autocomplete_dropdown: document.getElementById("autocomplete-list"),
    autocomplete_option_template: document.getElementById(
        "autocomplete-option-template"
    ),
};

function onclickAutocompleteOption(input, item, dropdown) {
    const page = window.STATES.actualPage;
    dropdown.dataset.attempts = JSON.stringify(
        dropdown.dataset.attempts
            ? [
                  ...JSON.parse(dropdown.dataset.attempts),
                  `${page.page}-${item.id}`,
              ]
            : [`${page.page}-${item.id}`]
    );
    dropdown.classList.add("hidden");
    input.value = "";
    setElementGameList(item);

    if (item.id === page.random.id) {
        console.log("Random item selected:", item);
        dropdown.dataset.won = JSON.stringify(
            dropdown.dataset.won
                ? [...JSON.parse(dropdown.dataset.won), page.page]
                : [page.page]
        );
    }
}

function handleInput() {
    const input = HTML_ELEMENTS.autocomplete_input;
    const dropdown = HTML_ELEMENTS.autocomplete_dropdown;
    const items = window.STATES.actualPage.data;
    const page = window.STATES.actualPage;
    const hasWon = dropdown.dataset.won ? JSON.parse(dropdown.dataset.won) : [];

    const columns_info = window.STATES.actualPage.autocomplete;
    const query = input.value.trim().toLowerCase();
    dropdown.innerHTML = "";
    const attempts = dropdown.dataset.attempts
        ? JSON.parse(dropdown.dataset.attempts)
        : [];

    if (!query) {
        dropdown.classList.add("hidden");
        return;
    }

    if (hasWon.includes(page.page)) {
        const option =
            HTML_ELEMENTS.autocomplete_option_template.content.cloneNode(true);
        option.querySelector("[option-name]").textContent = "Congratulations!";
        option.querySelector("[option-description]").textContent =
            "You have already won this level";
        dropdown.appendChild(option);
        dropdown.classList.remove("hidden");
        return;
    }

    const filtered = items
        .filter((item) => !attempts.includes(`${page.page}-${item.id}`))
        .filter((item) => {
            return columns_info.some((col) =>
                String(item[col]).toLowerCase().includes(query)
            );
        })
        .slice(0, 4);

    if (!filtered.length) {
        dropdown.classList.add("hidden");
        return;
    }

    filtered.forEach((item) => {
        const option =
            HTML_ELEMENTS.autocomplete_option_template.content.cloneNode(true);
        option.querySelector("[option-name]").textContent =
            item[columns_info[0]];
        option.querySelector("[option-description]").textContent = columns_info
            .slice(1)
            .map((col) => item[col])
            .join(" - ");

        const optionElement = option.firstElementChild;
        optionElement.addEventListener("click", () =>
            onclickAutocompleteOption(input, item, dropdown)
        );
        dropdown.appendChild(option);
    });

    dropdown.classList.remove("hidden");
}
export function setAutocomplete() {
    let timeout;
    HTML_ELEMENTS.autocomplete_input.addEventListener("input", () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            handleInput();
        }, 300);
    });

    document.addEventListener("click", (e) => {
        if (!HTML_ELEMENTS.autocomplete_wrapper.contains(e.target)) {
            HTML_ELEMENTS.autocomplete_dropdown.classList.add("hidden");
        }
    });
}
