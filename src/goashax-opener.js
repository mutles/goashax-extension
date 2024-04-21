
function openTab(username) {
    chrome.tabs.create({ url: `https://www.twitch.tv/${username}`, active: false }, (tab) => {
        chrome.tabs.update(tab.id, { highlighted: false, muted: true });
    });
}

function sleep(duration) {
    let cancelTimer;
    const promise = new Promise((resolve, reject) => {
        const timeoutID = setTimeout(resolve, duration);
        cancelTimer = () => {
            clearTimeout(timeoutID);
            resolve();
        };
    });
    return [promise, cancelTimer];
}

function getStorage(name) {
    return new Promise((resolve, reject) => chrome.storage.local.get(name, (x) => resolve(x[name])));
}

class Listener {
    constructor() {
        this.sleepDuration;
        this.username = "goashaxtv";
        this.previouslyOnline = false;

        this.toShutdown = false;
        this.promise;
        this.cancel;
        this.isActive = false;
    }

    async stop() {
        this.toShutdown = true;
        if (this.cancel) {
            this.cancel();
            await this.promise;
        }
    }

    async start() {
        this.toShutdown = false;
        await this.init();
        if (this.isActive) {
            this.listen();
        }
    }

    async init() {
        let interval = await getStorage("interval");
        this.sleepDuration = Math.max(interval ? interval : 5, 1) * 60 * 1000;
        this.isActive = await getStorage("ghax_enabled");
        console.log(this.isActive, this.sleepDuration);
    }

    async reload() {
        await this.stop();
        this.start();
    }

    async listen() {
        while (!this.toShutdown) {
            let response = await fetch(`https://decapi.me/twitch/uptime/${this.username}`);
            let text = await response.text();
            let isOnline = !text.includes("offline");
            if (isOnline && !this.previouslyOnline) {
                openTab(this.username);
            }
            this.previouslyOnline = isOnline;
            [this.promise, this.cancel] = sleep(this.sleepDuration);
            await this.promise;
        }
    }
}

async function init() {
    let listener = new Listener();
    listener.start();
    chrome.runtime.onMessage.addListener(function(request, sender) {
        if (request.type === "config_changed") {
            listener.reload();
            return Promise.resolve();
        }
        return false;
    });
}

init();

