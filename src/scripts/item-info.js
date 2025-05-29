const HTML_ELEMENTS = {
    game_lists: document.getElementById("game-lists"),
    game_list_item_template: document.getElementById("game-list-item-template"),
    game_successes: document.getElementById("game-successes"),
};

function compareValues(value1, value2, type, threshold) {
    switch (type) {
        case "int":
            if (value1 == value2) return 4;
            const diff1 = value1 - value2;
            const thres1 = threshold ?? 3;
            if (Math.abs(diff1) <= thres1) {
                if (diff1 < 0) return 1; // cerca y menor
                if (diff1 > 0) return 3; // cerca y mayor
            }
            return 0;
        case "float":
            if (value1 == value2) return 4;
            const diff2 = value1 - value2;
            const thres2 = threshold ?? 0.5;
            if (Math.abs(diff2) <= thres2) {
                if (diff2 < 0) return 1; // cerca y menor
                if (diff2 > 0) return 3; // cerca y mayor
            }
            return 0;
        case "options":
            if (JSON.stringify(value1) === JSON.stringify(value2)) return 4;
            if (value1.some((el) => value2.includes(el))) return 2; // cerca y no es número
            return 0;
        case "string":
            return value1 == value2 ? 4 : 0;
        default:
            return 0;
    }
}

function setItemInGameList(item, random) {
    const game_list = HTML_ELEMENTS.game_lists.querySelector(
        `[game="${window.LOCAL.actual_page}"]`
    );

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
                compare === 4
                    ? "border-[#6dd103]"
                    : compare <= 3 && compare >= 1
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

        const updateLightSuccess = (newValue, compare) => {
            light_success.dataset.best_value =
                type === "options" ? JSON.stringify(newValue) : newValue;
            if (compare === 1) {
                light_success.querySelector("[success-value]").textContent =
                    newValue + " ⇧";
            } else if (compare === 3) {
                light_success.querySelector("[success-value]").textContent =
                    newValue + " ⇩";
            } else {
                light_success.querySelector("[success-value]").textContent =
                    Array.isArray(newValue) ? newValue.join(", ") : newValue;
            }
        };

        const compare = compareValues(
            item[key],
            random[key],
            type,
            type === "int" ? 3 : type === "float" ? 0.5 : undefined
        );

        if (compare === 4) {
            updateLightSuccess(item[key], compare);
            light_success.classList.add("success");
        } else if (compare <= 3 && compare >= 1) {
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
                        updateLightSuccess(item[key], compare);
                    }
                } else if (
                    !best_value ||
                    Math.abs(item[key] - random[key]) <
                        Math.abs(best_value - random[key])
                ) {
                    updateLightSuccess(item[key], compare);
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
