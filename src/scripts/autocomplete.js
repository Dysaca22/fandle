import { setItemInfo } from "./item-info.js";

const HTML_ELEMENTS = {
    autocomplete_input: document.getElementById("autocomplete-input"),
    autocomplete_options: document.getElementById("autocomplete-options"),
    autocomplete_option_template: document.getElementById(
        "autocomplete-option-template"
    ),
};

function handleClick(event) {
    const option = event.target.closest("[data-id]");
    const value = option.dataset.id;
    const id = value.split("-")[1];
    setItemInfo(id);

    HTML_ELEMENTS.autocomplete_input.dataset.attempts = JSON.stringify(
        HTML_ELEMENTS.autocomplete_input.dataset.attempts
            ? [
                  ...JSON.parse(
                      HTML_ELEMENTS.autocomplete_input.dataset.attempts
                  ),
                  value,
              ]
            : [value]
    );

    const random = window.LOCAL.randoms[window.LOCAL.actual_page];
    if (value === `${window.LOCAL.actual_page}-${random}`) {
        console.log("Random item selected:", value);
        HTML_ELEMENTS.autocomplete_input.dataset.won = JSON.stringify(
            HTML_ELEMENTS.autocomplete_input.dataset.won
                ? [
                      ...JSON.parse(
                          HTML_ELEMENTS.autocomplete_input.dataset.won
                      ),
                      window.LOCAL.actual_page,
                  ]
                : [window.LOCAL.actual_page]
        );
    }

    HTML_ELEMENTS.autocomplete_options.classList.add("hidden");
    HTML_ELEMENTS.autocomplete_options.innerHTML = "";
    HTML_ELEMENTS.autocomplete_input.value = "";
}

function handleInput(event) {
    const input = event.target;
    const inputValue = input.value.toLowerCase().trim();
    const attempts = JSON.parse(input.dataset.attempts || "[]");
    const won = JSON.parse(input.dataset.won || "[]");

    if (inputValue === "") {
        HTML_ELEMENTS.autocomplete_options.classList.add("hidden");
        return;
    }
    HTML_ELEMENTS.autocomplete_options.classList.remove("hidden");
    HTML_ELEMENTS.autocomplete_options.innerHTML = "";

    if (won.includes(window.LOCAL.actual_page)) {
        const option =
            HTML_ELEMENTS.autocomplete_option_template.content.cloneNode(true);
        option.querySelector("[option-name]").textContent = "Congratulations!";
        option.querySelector("[option-description]").textContent =
            "You have already won this level";
        HTML_ELEMENTS.autocomplete_options.appendChild(option);
        return;
    }

    const actual_page = window.LOCAL.actual_page;
    const filteredOptions = window.LOCAL.actual_data
        .filter((item) => !attempts.includes(`${actual_page}-${item.id}`))
        .filter((item) => item.name.toLowerCase().includes(inputValue))
        .sort((a, b) => {
            const aIndex = a.name.toLowerCase().indexOf(inputValue);
            const bIndex = b.name.toLowerCase().indexOf(inputValue);
            if (aIndex !== bIndex) return aIndex - bIndex;
            return a.name.length - b.name.length;
        })
        .slice(0, 4);

    const autocomplete_description = window.LOCAL.pages_info
        .find((page) => page.page === actual_page)
        .autocomplete.split(", ");
    filteredOptions.forEach((option) => {
        const optionElement =
            HTML_ELEMENTS.autocomplete_option_template.content.cloneNode(true);
        optionElement.querySelector("[option-name]").textContent = option.name;
        optionElement.querySelector("[option-description]").textContent =
            autocomplete_description
                .slice(1)
                .map((col) => option[col])
                .join(" - ");
        optionElement.firstElementChild.dataset.id = `${actual_page}-${option.id}`;
        optionElement.firstElementChild.addEventListener("click", handleClick);
        HTML_ELEMENTS.autocomplete_options.appendChild(optionElement);
    });
}

export function setAutocomplete() {
    HTML_ELEMENTS.autocomplete_input.addEventListener("input", handleInput);
}
