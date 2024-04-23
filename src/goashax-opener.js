importScripts("browser-polyfill.min.js");
importScripts("helper.js");

async function openTab(username) {
    let tab = await browser.tabs.create({ url: `https://www.twitch.tv/${username}`, active: false });
    await browser.tabs.update(tab.id, { highlighted: false, muted: true });
}

async function configChanged() {
    await browser.alarms.clearAll();
    if (await getStorage("enabled")) {
        let interval = await getStorage("interval");
        await browser.alarms.create(
            "checkOnline",
            {
                delayInMinutes: interval,
                periodInMinutes: interval,
            }
        )
        await checkOnline();
    }
}

async function checkOnline() {
    console.log("Checking online status");
    let username = "goashaxtv";
    let response = await fetch(`https://decapi.me/twitch/uptime/${username}`);
    let text = await response.text();
    let isOnline = !text.includes("offline");
    let wasPreviouslyOnline = await getStorage("previouslyOnline");
    if (isOnline && !wasPreviouslyOnline) {
        console.log("Is now online. Opening in a new tab");
        await openTab(username);
    }
    await setStorage("previouslyOnline", isOnline);
}

async function init() {
    await setStorage("previouslyOnline", false);
    await configChanged();
}

browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "checkOnline") {
        return checkOnline();
    }
    return false;
});

browser.runtime.onMessage.addListener(function(request, sender) {
    if (request.type === "configChanged") {
        console.log("Config changed");
        return configChanged();
    }
    return false;
});

browser.runtime.onStartup.addListener(() => {
    init();
})

browser.runtime.onInstalled.addListener(() => {
    browser.tabs.create({url: browser.runtime.getURL('src/popup.html')})
})
