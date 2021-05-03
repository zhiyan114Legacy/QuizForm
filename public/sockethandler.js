var socket = null;
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
var audio = document.createElement("audio");
audio.style = "display:none;";
audio.src = "https://quizform.zhiyan114.com/ding.mp3"
async function Init(isRetry) {
    socket = new WebSocket('wss://quizform.zhiyan114.com/api/v1/realtime');
    socket.onopen = function(e) {
        isRetry = false;
        VanillaToasts.create({
            title: "Socket Connected",
            type: "success",
            text: "Socket established, you will now be able to receive all announcements and quiz submissions in realtime.",
            timeout: 20000
        })
    }
    socket.onmessage = function(e_msg) {
        const msg = JSON.parse(e_msg.data);
        if(document.getElementById("statboard") && msg["title"].toString().toLowerCase() == "submission") {
            updateList();
        }
        audio.currentTime = 0;
        audio.play();
        VanillaToasts.create({
            title: (msg["title"] || "Server Notification"),
            type: "info",
            text: (msg["message"] || "Server has sent a test message."),
            timeout: 30000
        })
    }
    socket.onerror = function(err) {
        if(!isRetry) {
            VanillaToasts.create({
                title: "Socket Error",
                type: "warning",
                text: "Websocket received an error and was automatically reported to the developer.",
                timeout: 15000
            })
        }
    }
    socket.onclose = function(e) {
        if(!isRetry) {
            VanillaToasts.create({
                title: "Socket Disconnected",
                type: "error",
                text: "Socket disconnected, you will now unable to receive any announcements or quiz submissions. It may take up to 10 seconds to reconnect or you can refresh the page to instantly reconnect.",
                timeout: 20000
            })
        }
    };
}
Init();
function ShowMsg(Title,Text,Icon) {
    VanillaToasts.create({
        title: Title,
        type: (Icon || "info"),
        text: Text,
        timeout: 15000
    })
};
// Re-connection handler (A shitty handler tbh)
(async ()=>{
    while(true) {
        await sleep(10000) // Check state every ten seconds
        if(!socket) {
            // How...
            Init();
        } else if(socket.readyState != WebSocket.OPEN) {
            // Socket are somehow unable to connect...
            if(socket.readyState == WebSocket.CONNECTING) {
                // Websocket stucked on connecting, retry
                var retrysec = 0;
                while(socket.readyState != WebSocket.OPEN) {
                    if(retrysec < 120) { retrysec+=5 }
                    socket.close();
                    ShowMsg("Socket Timeout",`Socket was unable to be connected, retry in ${retrysec} seconds.`,"error");
                    await sleep(retrysec*1000)
                    ShowMsg("Reconnecting","Socket will attempt to reconnect...","info")
                    Init(true);
                    await sleep(3000)
                }
            } else {
                // Socket already closed, reopen it.
                ShowMsg("Establishing Connection","Re-connecting socket...")
                while(socket.readyState == WebSocket.CLOSING) {
                    await sleep(1000)
                }
                Init();
                await sleep(3000)
                var retrysec = 0;
                while(socket.readyState != WebSocket.OPEN) {
                    if(retrysec < 120) { retrysec+=5 }
                    if(socket.readyState != WebSocket.CLOSED) { socket.close(); }
                    ShowMsg("Socket Timeout",`Socket was unable to be connected, retry in ${retrysec} seconds.`,"error");
                    await sleep(retrysec*1000)
                    ShowMsg("Reconnecting","Socket will attempt to reconnect...","info")
                    Init(true);
                    await sleep(3000)
                }
            }
        }
    }
})();