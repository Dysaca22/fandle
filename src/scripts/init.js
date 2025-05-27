import { setAutocomplete } from "./autocomplete.js";
import { _readGoogleSheet } from "./data.js";

const HTML_ELEMENTS = {
    nav_list: document.getElementById("nav-list"),
    nav_template: document.getElementById("nav-template"),
    content: document.getElementById("content"),
    game_template: document.getElementById("game-template"),
};
const SHEETID = "1AFLYBWVzejW-Xk2frn7uBEPkjLC9Mp-2V7XQcQt2O6w";
const SHEETNAMES = { config: "Config", pages: "Pages" };
window.STATES = {
    actualPage: {},
};
window.DATA = [];

function loadNavBar(item, index) {
    const navTemplate = HTML_ELEMENTS.nav_template.content.cloneNode(true);
    const input = navTemplate.querySelector("input");
    input.value = item.page;
    if (index === 0) {
        input.checked = true;
        window.STATES.actualPage = window.DATA.find(
            (page) => page.page === item.page
        );
    }
    input.addEventListener("input", () => {
        document
            .querySelectorAll(".game")
            .forEach((e) => e.classList.add("hidden"));
        document
            .querySelector(`[game-${this.value}]`)
            .classList.remove("hidden");
        window.STATES.actualPage = window.DATA.find(
            (item) => item.page === this.value
        );
    });
    navTemplate.querySelector(".icon").innerHTML = item.icon || "";
    HTML_ELEMENTS.nav_list.appendChild(navTemplate);
}

function loadContent(item, index) {
    const gameTemplate = HTML_ELEMENTS.game_template.content.cloneNode(true);
    const game = gameTemplate.querySelector(".game");
    gameTemplate.querySelector("[game-title]").innerText = item.title;
    gameTemplate.querySelector("[game-subtitle]").innerText = item.subtitle;
    game.setAttribute(`game-${item.page}`, "");
    if (index !== 0) game.classList.add("hidden");
    setAutocomplete(
        gameTemplate.querySelector(".autocomplete-wrapper"),
        item.data,
        item.random
    );
    HTML_ELEMENTS.content.appendChild(gameTemplate);
}

const loadHtml = (data) =>
    data.forEach((item, index) => {
        loadNavBar(item, index);
        loadContent(item, index);
    });

function prepareData(config, data) {
    if (!config || !data?.length) return [];

    const typeHandlers = {
        int: (val) => parseInt(val) || 0,
        float: (val) => parseFloat(val) || 0.0,
        options: (val) => val.split(",").map((option) => option.trim()),
        string: (val) => val?.toString() || "",
    };

    Object.entries(config).forEach(([key, value]) => {
        if (!value || typeof value !== "string") return;
        const handler = typeHandlers[value.toLowerCase()];
        if (!handler) return;

        data.forEach((item) => {
            if (!item?.hasOwnProperty(key)) return;
            try {
                item[key] = handler(item[key]);
            } catch (error) {
                console.error(
                    `Error processing ${key} with value ${item[key]}:`,
                    error
                );
            }
        });
    });
    return data;
}

async function _init() {
    const [config, pages] = await Promise.all([
        _readGoogleSheet(SHEETID, SHEETNAMES.config),
        _readGoogleSheet(SHEETID, SHEETNAMES.pages),
    ]);

    await Promise.all(
        pages.map(async (page) => {
            const pageData = await _readGoogleSheet(SHEETID, page.page);
            const pageConfig = config
                .filter((item) => item.page === page.page)
                .reduce(
                    (acc, item) => ({ ...acc, [item.column]: item.type }),
                    {}
                );
            const data = prepareData(pageConfig, pageData);
            window.DATA.push({
                ...page,
                autocomplete: page.autocomplete.split(",").map((item) => item.trim()),
                config: pageConfig,
                data,
                random: data.length
                    ? data[Math.floor(Math.random() * data.length)]
                    : null,
            });
        })
    );

    DATA.sort((a, b) => a.page.localeCompare(b.page));
    loadHtml(window.DATA);
    console.log(window.DATA);
}

await _init();
