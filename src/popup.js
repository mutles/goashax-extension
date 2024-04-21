(function() {
    let input = document.getElementById("id_enable-ghax");
    input.addEventListener("change", async () => {
        let checked = input.checked;
        chrome.storage.local.set({"ghax_enabled": checked});
        if (checked) {
            let promise = browser.permissions.request({origins: ["https://decapi.me/twitch/uptime/*"]});
            window.close()
            await promise;
        }
        chrome.runtime.sendMessage(null, {type: "config_changed"})
    });
    chrome.storage.local.get("ghax_enabled", (x) => input.checked = x.ghax_enabled);

    let intervalInput = document.getElementById("id_interval");
    intervalInput.addEventListener("input", () => {
        chrome.storage.local.set({"interval": intervalInput.value});
        chrome.runtime.sendMessage(null, {type: "config_changed"})
    });
    chrome.storage.local.get("interval", (x) => intervalInput.value = x.interval);
})();
