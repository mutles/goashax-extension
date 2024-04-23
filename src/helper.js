async function getStorage(name) {
    return (await browser.storage.local.get(name))[name]
}

async function setStorage(name, value) {
    await browser.storage.local.set({[name]: value})
}

function isInPopup() {
    return (typeof chrome != undefined && chrome.extension) ? chrome.extension.getViews({ type: "popup" }).length > 0 : null;
}
