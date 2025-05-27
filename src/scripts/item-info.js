const HTML_ELEMENTS = {
    game_lists: document.getElementById("game-lists"),
    game_list_item_template: document.getElementById("game-list-item-template"),
    game_successes: document.getElementById("game-successes"),
};

function setItemInGameList(item) {
    const game_list = HTML_ELEMENTS.game_lists.querySelector(
        `[game="${window.LOCAL.actual_page}"]`
    );
    const item_element =
        HTML_ELEMENTS.game_list_item_template.content.cloneNode(true);
    item_element.querySelector("[item-name]").textContent = item.name;
    item_element.querySelector("[item-description]").innerHTML =
        Object.entries(item)
            .filter(([key]) => key !== "name" && key !== "id")
            .map(([key, value]) => `<p class="px-2 py-1 border border-gray-300 rounded-full"><span class="capitalize font-semibold">${key.replaceAll("_", " ")}</span>: ${value}</p>`)
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

    Object.entries(config).forEach(([key, value]) => {
        const light_success = success.querySelector(
            `[success-light][data-key="${key}"]`
        );
        const best_value = light_success.dataset.best_value
            ? value === "options"
                ? JSON.parse(light_success.dataset.best_value)
                : light_success.dataset.best_value
            : null;

        const updateLightSuccess = (newValue) => {
            light_success.dataset.best_value =
                value === "options" ? JSON.stringify(newValue) : newValue;
            light_success.querySelector("[success-value]").textContent =
                newValue;
        };

        const handleNumericComparison = (threshold) => {
            if (item[key] == random[key]) {
                updateLightSuccess(item[key]);
                light_success.classList.add("success");
            } else if (Math.abs(item[key] - random[key]) <= threshold) {
                if (
                    !light_success.classList.contains("success") &&
                    (!best_value ||
                        Math.abs(item[key] - random[key]) <
                            Math.abs(best_value - random[key]))
                ) {
                    updateLightSuccess(item[key]);
                }
                light_success.classList.add("close");
            }
        };

        switch (value) {
            case "int":
                handleNumericComparison(3);
                break;
            case "float":
                handleNumericComparison(0.5);
                break;
            case "options":
                if (JSON.stringify(item[key]) === JSON.stringify(random[key])) {
                    updateLightSuccess(item[key].join(", "));
                    light_success.classList.add("success");
                } else if (
                    item[key].some((element) => random[key].includes(element))
                ) {
                    if (!light_success.classList.contains("success")) {
                        const currentMatches = item[key].filter((element) =>
                            random[key].includes(element)
                        ).length;
                        const bestMatches = best_value
                            ? best_value
                                  .split(", ")
                                  .filter((element) =>
                                      random[key].includes(element)
                                  ).length
                            : -1;
                        if (currentMatches > bestMatches) {
                            updateLightSuccess(item[key].join(", "));
                        }
                    }
                    light_success.classList.add("close");
                }
                break;
            case "string":
                if (item[key] == random[key]) {
                    updateLightSuccess(item[key]);
                    light_success.classList.add("success");
                }
                break;
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
    setItemInGameList(item);
}
