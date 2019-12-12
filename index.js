function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function parseNumber(s) {
    let matches = s.match(/\/?([0-9.]*)([KMBTP]?)/);
    if (!matches || matches.length === 0)
        throw new Error(`No match for regexp in ${s}`);
    let n = parseInt(matches[1]);
    let exponent = (() => {
        if (matches.length < 3 || matches[2] == "")
            return 0;
        switch (matches[2]) {
            case 'K': return 3;
            case 'M': return 6;
            case 'B': return 9;
            case 'T': return 12;
            case 'P': return 15;
            default:
                throw new Error(`unknown exponent in ${matches[2].toLowerCase()} in ${s}`);
        }
    })();
    console.log(s);
    let result = n * Math.pow(10, exponent);
    if (result == NaN)
        throw new Error(`${s} parsed to n=${n} and exponent=${exponent}`);
    return result;
}
function parseResource(e) {
    const name = e.innerText;
    const value = parseNumber(e.nextElementSibling.innerText);
    const limit = parseNumber(e.nextElementSibling.nextElementSibling.innerText);
    return { name: name, value: value, limit: limit };
}
const resources = { catnip: { name: "catnip", value: 0, limit: 0 } };
function loadResources() {
    for (let e of document.querySelectorAll(".resource-name").values()) {
        if (e.innerText == "catnip") {
            resources.catnip = parseResource(e);
        }
    }
}
function action() {
    loadResources();
    let btns = Array.from(document.querySelectorAll("div.btn"));
    if (!btns.find(b => b.innerText == "Gather catnip"))
        return;
    for (const b of btns) {
        if (b.classList.contains("disabled"))
            continue;
        if (b.innerText.search(/(Refine catnip)|(Catnip field)/) != -1 && (resources.catnip.value / resources.catnip.limit) < 0.95)
            continue;
        console.log("Clicked: ", b);
        b.click();
        // Only one non-gather/refine building click.
        if (!b.innerText.match(/(?:Gather|Refine) catnip/))
            return;
    }
}
export async function kittensScriptMain() {
    while (true) {
        await delay(1000);
        try {
            action();
        }
        catch (e) {
            console.warn(e);
            await delay(60000);
        }
    }
}
