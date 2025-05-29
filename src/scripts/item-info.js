const HTML_ELEMENTS = {
    game_lists: document.getElementById("game-lists"),
    game_list_item_template: document.getElementById("game-list-item-template"),
    game_successes: document.getElementById("game-successes"),
};

/**
 * Compara dos valores según el tipo y retorna:
 * 0 = diferente, 1 = cerca, 2 = igual
 * @param {*} value1
 * @param {*} value2
 * @param {'int'|'float'|'options'|'string'} type
 * @param {number} [threshold]
 * @returns {0|1|2}
 */
function compareValues(value1, value2, type, threshold) {
    switch (type) {
        case "int":
        case "float":
            if (value1 == value2) return 2;
            if (
                Math.abs(value1 - value2) <=
                (threshold ?? (type === "int" ? 3 : 0.5))
            )
                return 1;
            return 0;
        case "options":
            if (JSON.stringify(value1) === JSON.stringify(value2)) return 2;
            if (value1.some((el) => value2.includes(el))) return 1;
            return 0;
        case "string":
            return value1 == value2 ? 2 : 0;
        default:
            return 0;
    }
}

function setItemInGameList(item, random) {
    const game_list = HTML_ELEMENTS.game_lists.querySelector(
        `[game="${window.LOCAL.actual_page}"]`
    );

    // Obtener la configuración para saber el tipo de cada campo
    const config = window.LOCAL.pages_info.find(
        (p) => p.page === window.LOCAL.actual_page
    ).config;

    const item_element =
        HTML_ELEMENTS.game_list_item_template.content.cloneNode(true);
    item_element.querySelector("[item-name]").textContent = item.name;
    item_element.querySelector("[item-description]").innerHTML = Object.entries(
        item
    )
        .filter(([key]) => key !== "name" && key !== "id")
        .map(([key, value]) => {
            const type = config[key];
            const compare = compareValues(value, random[key], type);
            const border =
                compare === 2
                    ? "border-[#6dd103]"
                    : compare === 1
                    ? "border-[#e0b903]"
                    : "border-gray-300";
            return `<p class="px-2 py-1 border ${border} rounded-full"><span class="capitalize font-semibold">${key.replaceAll(
                "_",
                " "
            )}</span>: ${Array.isArray(value) ? value.join(", ") : value}</p>`;
        })
        .join(" • ");
    game_list.insertBefore(item_element, game_list.firstChild);
}

function setKPIs(item, random) {
    const success = HTML_ELEMENTS.game_successes.querySelector(
        `[game=${window.LOCAL.actual_page}]`
    );
    const config = window.LOCAL.pages_info.find(
        (item) => item.page === window.LOCAL.actual_page
    ).config;

    Object.entries(config).forEach(([key, type]) => {
        const light_success = success.querySelector(
            `[success-light][data-key="${key}"]`
        );
        const best_value = light_success.dataset.best_value
            ? type === "options"
                ? JSON.parse(light_success.dataset.best_value)
                : light_success.dataset.best_value
            : null;

        const updateLightSuccess = (newValue) => {
            light_success.dataset.best_value =
                type === "options" ? JSON.stringify(newValue) : newValue;
            light_success.querySelector("[success-value]").textContent =
                Array.isArray(newValue) ? newValue.join(", ") : newValue;
        };

        const compare = compareValues(
            item[key],
            random[key],
            type,
            type === "int" ? 3 : type === "float" ? 0.5 : undefined
        );

        if (compare === 2) {
            updateLightSuccess(item[key]);
            light_success.classList.add("success");
        } else if (compare === 1) {
            if (!light_success.classList.contains("success")) {
                if (type === "options") {
                    const currentMatches = item[key].filter((element) =>
                        random[key].includes(element)
                    ).length;
                    const bestMatches = best_value
                        ? best_value.filter((element) =>
                              random[key].includes(element)
                          ).length
                        : -1;
                    if (currentMatches > bestMatches) {
                        updateLightSuccess(item[key]);
                    }
                } else if (
                    !best_value ||
                    Math.abs(item[key] - random[key]) <
                        Math.abs(best_value - random[key])
                ) {
                    updateLightSuccess(item[key]);
                }
            }
            light_success.classList.add("close");
        }
    });
}

export function setItemInfo(id) {
    const item = window.LOCAL.actual_data.find((item) => item.id == id);
    const random_id = window.LOCAL.randoms[window.LOCAL.actual_page];
    const random = window.LOCAL.actual_data.find(
        (item) => item.id == random_id
    );
    setKPIs(item, random);
    setItemInGameList(item, random);
}
