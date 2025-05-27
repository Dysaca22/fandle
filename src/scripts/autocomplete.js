import { setElementGameList } from "./game-list.js";

function onclickAutocompleteOption(input, item, dropdown, random) {
    dropdown.dataset.tries = JSON.stringify(
        dropdown.dataset.tries
            ? [...JSON.parse(dropdown.dataset.tries), item.id]
            : [item.id]
    );
    dropdown.classList.add("hidden");
    input.value = "";
    setElementGameList(item);

    if (item.id === random.id) {
        console.log("Random item selected:", item);
        input.disabled = true;
    }
}

function handleInput(input, dropdown, items, random) {
    const columns_info = window.STATES.actualPage.autocomplete;
    const query = input.value.trim().toLowerCase();
    dropdown.innerHTML = "";
    const tries = dropdown.dataset.tries
        ? JSON.parse(dropdown.dataset.tries)
        : [];

    if (!query) {
        dropdown.classList.add("hidden");
        return;
    }

    const filtered = items
        .filter((item) => !tries.includes(item.id))
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

    const template = document.querySelector("#autocomplete-option");
    filtered.forEach((item) => {
        const option = template.content.cloneNode(true);
        option.querySelector("[option-name]").textContent =
            item[columns_info[0]];
        option.querySelector("[option-description]").textContent = columns_info
            .slice(1)
            .map((col) => item[col])
            .join(" - ");

        const optionElement = option.firstElementChild;
        optionElement.addEventListener("click", () =>
            onclickAutocompleteOption(input, item, dropdown, random)
        );
        dropdown.appendChild(option);
    });

    dropdown.classList.remove("hidden");
}

export function setAutocomplete(wrapper, items, random) {
    const input = wrapper.querySelector(".autocomplete-input");
    const dropdown = wrapper.querySelector(".autocomplete-list");

    let timeout;
    input.addEventListener("input", () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            handleInput(input, dropdown, items, random);
        }, 300);
    });

    document.addEventListener("click", (e) => {
        if (!wrapper.contains(e.target)) {
            dropdown.classList.add("hidden");
        }
    });
}
