import { loadGame } from "./game.js";

const HTML_ELEMENTS = {
    nav: document.getElementById("nav"),
    nav_tab_template: document.getElementById("nav-tab-template"),
};

async function handleTabInput(event) {
    const page = event.target.value;
    localStorage.setItem("last-game-page", page);
    await loadGame(page);
}

async function createTab(last_game, page_name, index) {
    const tab = HTML_ELEMENTS.nav_tab_template.content.cloneNode(true);
    const radio = tab.querySelector("[nav-radio]");
    radio.value = page_name;
    radio.addEventListener("input", handleTabInput);
    tab.querySelector("[nav-label]").textContent = page_name;
    if (last_game === page_name) {
        radio.checked = true;
        await loadGame(page_name);
    } else if (index === 0) {
        radio.checked = true;
        localStorage.setItem("last-game-page", page_name);
        await loadGame(page_name);
    }
    HTML_ELEMENTS.nav.appendChild(tab);
}

export function loadNav(pages) {
    const last_game = localStorage.getItem("last-game-page");
    pages.forEach(async (item, index) => {
        await createTab(last_game, item.page, index);
    });
}
