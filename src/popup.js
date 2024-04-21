(function() {
    let input = document.getElementById("id_enable-ghax");
    const isInPopup = function() {
        return (typeof chrome != undefined && chrome.extension) ?
            chrome.extension.getViews({ type: "popup" }).length > 0 : null;
    }
    input.addEventListener("change", async () => {
        let checked = input.checked;
        chrome.storage.local.set({"ghax_enabled": checked});
        if (checked) {
            let promise = browser.permissions.request({origins: ["https://decapi.me/twitch/uptime/*"]});
            if (isInPopup() && !(await browser.permissions.contains({origins: ["https://decapi.me/twitch/uptime/*"]}))) {
                window.close();
            }
            await promise;
        }
        chrome.runtime.sendMessage(null, {type: "config_changed"})
    });
    chrome.storage.local.get("ghax_enabled", (x) => input.checked = x.ghax_enabled);

    let intervalInput = document.getElementById("id_interval");
    intervalInput.addEventListener("input", () => {
        chrome.storage.local.set({"interval": parseInt(intervalInput.value)});
        chrome.runtime.sendMessage(null, {type: "config_changed"})
    });
    chrome.storage.local.get("interval", (x) => intervalInput.value = x.interval);
})();
