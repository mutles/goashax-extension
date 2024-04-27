async function getStorage(name) {
    return (await browser.storage.local.get(name))[name]
}

async function setStorage(name, value) {
    await browser.storage.local.set({[name]: value})
}

function isInPopup() {
    return (typeof chrome != undefined && chrome.extension) ? chrome.extension.getViews({ type: "popup" }).length > 0 : null;
}

function localizeHTML() {
    let allTextNodes = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let regex = /__MSG_(\w+)__/g;
    while (allTextNodes.nextNode()) {
        let node = allTextNodes.currentNode;
        let text = node.nodeValue;
        node.nodeValue = text.replace(regex, (_, message) => message ? chrome.i18n.getMessage(message) : "");
    }
}
