(async function() {
    localizeHTML();

    const DEFAULT_INTERVAL = 5;

    let enabledCheckbox = document.getElementById("id_enabled");
    let intervalInput = document.getElementById("id_interval");

    let enabled = await getStorage("enabled");
    let interval = await getStorage("interval");
    if (!interval) {
        interval = DEFAULT_INTERVAL;
        await setStorage("interval", interval);
    }

    enabledCheckbox.checked = enabled;
    intervalInput.value = interval;

    enabledCheckbox.addEventListener("change", async () => {
        enabled = enabledCheckbox.checked;
        if (enabled) {
            let promise = browser.permissions.request({origins: ["https://decapi.me/twitch/uptime/*"]});
            if (isInPopup() && !(await browser.permissions.contains({origins: ["https://decapi.me/twitch/uptime/*"]}))) {
                window.close();
            }
            await promise;
        }
        await setStorage("enabled", enabled);
        await browser.runtime.sendMessage(null, {type: "configChanged"})
    });

    intervalInput.addEventListener("input", async () => {
        await setStorage("interval", parseInt(intervalInput.value) || DEFAULT_INTERVAL);
        await browser.runtime.sendMessage(null, {type: "configChanged"})
    });
})();
