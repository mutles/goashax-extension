
function openTab(username) {
    browser.tabs.create({ url: `https://www.twitch.tv/${username}`, active: false }, (tab) => {
        browser.tabs.update(tab.id, { highlighted: false, muted: true });
    });
}

async function getStorage(name) {
    return (await browser.storage.local.get(name))[name]
}

async function getIsActive() {
    return await getStorage("ghax_enabled");
}

async function getInterval() {
    let interval = await getStorage("interval");
    return Math.max(interval ? interval : 5, 1);
}

async function getWasPreviouslyOnline() {
    return await getStorage("previously_online") || false;
}

async function getUsername() {
    return "goashaxtv";
}

async function configChanged() {
    browser.alarms.clearAll();
    if (await getIsActive()) {
        let interval = await getInterval();
        browser.alarms.create(
            "check_online",
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
    let username = await getUsername();
    let response = await fetch(`https://decapi.me/twitch/uptime/${username}`);
    let text = await response.text();
    let isOnline = !text.includes("offline");
    let wasPreviouslyOnline = await getWasPreviouslyOnline();
    if (isOnline && !wasPreviouslyOnline) {
        console.log("Is now online. Opening in a new tab");
        openTab(username);
    }
    await browser.storage.local.set({previously_online: isOnline});
}

async function init() {
    await browser.storage.local.set({previously_online: false});
    configChanged();
}

browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "check_online") {
        return checkOnline();
    }
    return false;
});

browser.runtime.onMessage.addListener(function(request, sender) {
    if (request.type === "config_changed") {
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
