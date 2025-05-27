const HTML_ELEMENTS = {
    game_list_template: document.getElementById("game-list-template"),
}

function addDescripton(key, value, item, page) {
    const p = document.createElement("p");
    p.classList.add(
        "px-4",
        "py-2",
        "text-sm",
        "text-gray-300",
        "flex",
        "flex-row",
        "items-center"
    );
    const random = page.random;

    switch (page.config[key]) {
        case "int":
            if (JSON.stringify(item[key]) === JSON.stringify(random[key])) {
                p.classList.add("match-ok");
            } else if (Math.abs(item[key] - random[key]) <= 3) {
                p.classList.add("match-close");
            } else {
                p.classList.add("match-wrong");
            }
            p.textContent = `${key}: ${value}`;
            break;
        case "float":
            if (JSON.stringify(item[key]) === JSON.stringify(random[key])) {
                p.classList.add("match-ok");
            } else if (Math.abs(item[key] - random[key]) <= 0.5) {
                p.classList.add("match-close");
            } else {
                p.classList.add("match-wrong");
            }
            p.textContent = `${key}: ${value}`;
            break;
        case "options":
            if (JSON.stringify(item[key]) === JSON.stringify(random[key])) {
                p.classList.add("match-ok");
            } else if (random[key].some((element) => item[key].includes(element))) {
                p.classList.add("match-close");
            } else {
                p.classList.add("match-wrong");
            }
            p.textContent = `${key}: ${value.join(", ")}`;
            break;
        case "string":
            if (JSON.stringify(item[key]) === JSON.stringify(random[key])) {
                p.classList.add("match-ok");
            } else {
                p.classList.add("match-wrong");
            }
            p.textContent = `${key}: ${value}`;
            break;
    }
    return p;
}

export function setElementGameList(item) {
    const page = window.STATES.actualPage
    const game_list = document.querySelector(`[game='${page.page}']`);
    const game_list_template = HTML_ELEMENTS.game_list_template
        .content.cloneNode(true);

    game_list_template.querySelector("[game-title]").textContent =
        item[page.autocomplete[0]];
    Object.entries(item)
        .filter(
            ([key]) =>
                key !== window.STATES.actualPage.autocomplete[0] && key !== "id"
        )
        .forEach(([key, value]) => {
            const p = addDescripton(key, value, item, page);
            game_list_template
                .querySelector("[game-description]")
                .appendChild(p);
        });
    game_list.insertBefore(game_list_template, game_list.firstChild);
}
