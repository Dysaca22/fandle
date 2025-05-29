import { _readGoogleSheet, prepareData } from "./data.js";

const HTML_ELEMENTS = {
    game_lists: document.getElementById("game-lists"),
    game_successes: document.getElementById("game-successes"),
    success_light_template: document.getElementById("success-light-template"),
    page_name: document.getElementById("page-name"),
    autocomplete_input: document.getElementById("autocomplete-input"),
    play_again: document.getElementById("play-again"),
    hint: document.getElementById("hint"),
    game_status: document.getElementById("game-status"),
};

export async function loadGame(page) {
    window.LOCAL.actual_page = page;
    document.querySelectorAll(`[game]`).forEach((item) => {
        item.classList.add("hidden");
    });
    document.querySelectorAll(`[game="${page}"]`).forEach((item) => {
        item.classList.remove("hidden");
    });
    HTML_ELEMENTS.page_name.textContent = page;
    HTML_ELEMENTS.autocomplete_input.placeholder = `The ${page} is...`;

    const config = window.LOCAL.pages_info.find(
        (item) => item.page === window.LOCAL.actual_page
    ).config;
    const data = await _readGoogleSheet(window.LOCAL.sheet_id, page);
    window.LOCAL.actual_data = prepareData(config, data);

    if (HTML_ELEMENTS.autocomplete_input.dataset.won?.includes(page)) {
        HTML_ELEMENTS.play_again.classList.remove("hidden");
    } else {
        HTML_ELEMENTS.play_again.classList.add("hidden");
    }
    HTML_ELEMENTS.hint.disabled =
        HTML_ELEMENTS.hint.dataset.games?.includes(page);

    const game_status = JSON.parse(
        HTML_ELEMENTS.game_status.dataset.games || "{}"
    );
    if (Object.keys(game_status).includes(page)) {
        HTML_ELEMENTS.game_status.textContent = game_status[page];
    } else {
        HTML_ELEMENTS.game_status.textContent = 0;
        HTML_ELEMENTS.game_status.dataset.games = JSON.stringify({
            ...game_status,
            [page]: 0,
        });
    }
}

export function initialGameElements(pages) {
    pages.forEach((page) => {
        const div = document.createElement("div");
        div.className =
            "flex flex-row flex-wrap gap-x-2 md:gap-x-6 items-start justify-center overflow-y-auto h-full hidden";
        div.setAttribute("game", page.page);

        Object.entries(page.config).forEach(([key, value]) => {
            const success_light =
                HTML_ELEMENTS.success_light_template.content.cloneNode(true);
            success_light.firstElementChild.dataset.key = key;
            const key_string = key.replaceAll("_", " ");
            success_light.querySelector("[success-property]").textContent =
                key_string;
            success_light.querySelector("[success-value]").textContent = "???";
            div.appendChild(success_light);
        });
        HTML_ELEMENTS.game_successes.appendChild(div);

        const div2 = document.createElement("div");
        div2.className = "flex flex-col gap-4 overflow-y-auto w-full h-full";
        div2.setAttribute("game", page.page);
        div2.setAttribute("game-list", "");
        HTML_ELEMENTS.game_lists.appendChild(div2);
    });
}
