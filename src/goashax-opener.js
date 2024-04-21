
function openTab(username) {
    browser.tabs.create({ url: `https://www.twitch.tv/${username}`, active: false }, (tab) => {
        browser.tabs.update(tab.id, { highlighted: false, muted: true });
    });
}

async function getIsActive() {
    return await browser.storage.local.get("ghax_enabled");
}

async function getInterval() {
    let interval = await browser.storage.local.get("interval");
    return Math.max(interval ? interval : 5, 1);
}

async function getWasPreviouslyOnline() {
    return await browser.storage.local.get("previously_online");
}

async function configChanged() {
    browser.alarms.clearAll();
    if (await getIsActive()) {
        browser.alarms.create(
            "check_online",
            {
                delayInMinutes: 0,
                periodInMinutes: await getInterval(),
            }
        )
    }
}

async function checkOnline() {
    let response = await fetch(`https://decapi.me/twitch/uptime/${this.username}`);
    let text = await response.text();
    let isOnline = !text.includes("offline");
    let wasPreviouslyOnline = await getWasPreviouslyOnline();
    if (isOnline && !wasPreviouslyOnline) {
        openTab(this.username);
    }
    await browser.storage.local.set("previously_online", isOnline);
}

browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "check_online") {
        return checkOnline();
    }
    return false;
});

browser.runtime.onMessage.addListener(function(request, sender) {
    if (request.type === "config_changed") {
        return configChanged();
    }
    return false;
});

