import { _readGoogleSheet, prepareData } from "./data.js";
import { setAutocomplete } from "./autocomplete2.js";
import { loadNavBar } from "./navbar.js";

const HTML_ELEMENTS = {
    game_list: document.getElementById("game-lists"),
}

const SHEETID = "1AFLYBWVzejW-Xk2frn7uBEPkjLC9Mp-2V7XQcQt2O6w";
const SHEETNAMES = { config: "Config", pages: "Pages" };
window.STATES = {
    actualPage: {},
};
window.DATA = [];

function loadContent(item, index) {
    const div = document.createElement("div");
    div.setAttribute("game", item.page);
    div.classList.add("my-game");
    if (index > 0) {
        div.classList.add("hidden");
    }
    HTML_ELEMENTS.game_list.appendChild(div);
}

const loadHtml = (data) => {
    data.forEach((item, index) => {
        loadNavBar(item, index);
        loadContent(item, index);
    });
    setAutocomplete();
};

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
                autocomplete: page.autocomplete
                    .split(",")
                    .map((item) => item.trim()),
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
