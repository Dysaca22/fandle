import { setAutocomplete } from "./autocomplete.js";
import { initialGameElements } from "./game.js";
import { _readGoogleSheet } from "./data.js";
import { loadNav } from "./navbar.js";

window.LOCAL = {
    sheet_id: "1AFLYBWVzejW-Xk2frn7uBEPkjLC9Mp-2V7XQcQt2O6w",
    pages_info: {},
    randoms: {},
    actual_data: {},
    actual_page: "",
};

const HTML_ELEMENTS = {
    hint: document.getElementById("hint"),
};

function generateRandom() {
    const timestamp = Date.now();
    const cryptoValues = new Uint32Array(window.LOCAL.pages_info.length);
    crypto.getRandomValues(cryptoValues);

    window.LOCAL.randoms = window.LOCAL.pages_info.reduce(
        (acc, item, index) => {
            const seed = (timestamp + cryptoValues[index]).toString();
            const hash = Array.from(seed).reduce(
                (h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0,
                0
            );
            const random = Math.abs(hash) % item.total;
            return {
                ...acc,
                [item.page]: random,
            };
        },
        {}
    );
}

function giveHint() {
    HTML_ELEMENTS.hint.addEventListener("click", () => {
        HTML_ELEMENTS.hint.disabled = true;
        HTML_ELEMENTS.hint.dataset.games = JSON.stringify(
            HTML_ELEMENTS.hint.dataset.games
                ? [
                      ...JSON.parse(HTML_ELEMENTS.hint.dataset.games),
                      window.LOCAL.actual_page,
                  ]
                : [window.LOCAL.actual_page]
        );
        alert("F*** you. No hint for you!");
    });
}

async function __init() {
    window.LOCAL.pages_info = await _readGoogleSheet(
        window.LOCAL.sheet_id,
        "Pages"
    );

    const config = await _readGoogleSheet(window.LOCAL.sheet_id, "Config");
    window.LOCAL.pages_info.forEach((page) => {
        const pageConfig = config
            .filter((item) => item.page === page.page)
            .reduce((acc, item) => ({ ...acc, [item.column]: item.type }), {});
        page.config = pageConfig;
    });

    generateRandom();
    initialGameElements(window.LOCAL.pages_info);
    loadNav(window.LOCAL.pages_info);
    setAutocomplete();
    giveHint();
    console.log(window.LOCAL.randoms);
}

function hideLoadingShowMain() {
    document
        .querySelectorAll(".loading")
        .forEach((el) => el.classList.add("hidden"));
    const main = document.querySelector("main");
    if (main) main.classList.remove("hidden");
}

(async () => {
    await Promise.all([
        __init(),
        new Promise((resolve) => setTimeout(resolve, 5000)),
    ]);
    hideLoadingShowMain();
})();
