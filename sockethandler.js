var socket = null;
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function Init() {
    socket = new WebSocket('wss://quizformbackend.zhiyan114.com:23');
    socket.onopen = function(e) {
        VanillaToasts.create({
            title: "Socket Connected",
            type: "info",
            text: "Socket established, you will now be able to receive all announcements and quiz submissions in realtime.",
            timeout: 15000
        })
    }
    socket.onmessage = function(e_msg) {
        const msg = JSON.parse(e_msg);
        VanillaToasts.create({
            title: (msg["title"] || "Server Notification"),
            type: "info",
            text: (msg["message"] || "Server has sent a test message."),
            timeout: 20000
        })
    }
    socket.onerror = function(err) {
        VanillaToasts.create({
            title: "Socket Error",
            type: "warning",
            text: "Websocket received an error and was automatically reported to the developer.",
            timeout: 10000
        })
    }
    socket.onclose = function(e) {
        VanillaToasts.create({
            title: "Socket Disconnected",
            type: "error",
            text: "Socket disconnected, you will now unable to receive any announcements or quiz submissions. It may take up to 30 seconds to reconnect or you can refresh the page to instantly reconnect.",
            timeout: 15000
        })
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
        await sleep(30000) // Check state every half minutes
        if(!socket) {
            // How...
            socket = new WebSocket('wss://quizformbackend.zhiyan114.com:23');
        } else if(socket.readyState != WebSocket.OPEN) {
            // Socket are somehow able to connect...
            if(socket.readyState == WebSocket.CONNECTING) {
                // Websocket stucked on connecting, retry
                var retrysec = 0;
                while(socket.readyState != WebSocket.OPEN) {
                    if(retrysec < 120) { retrysec+=5 }
                    socket.close();
                    ShowMsg("Socket Timeout",`Socket was unable to be connected, retry in ${retrysec} seconds.`,"error");
                    await sleep(retrysec*1000)
                    ShowMsg("Reconnecting","Socket will attempt to reconnect...","info")
                    Init();
                    await sleep(3000)
                }
                ShowMsg("Socket Reconnected","Socket has been successfully reconnected","success")
            } else {
                // Socket already closed, reopen it.
                ShowMsg("Establishing Connection","Re-connecting socket...")
                while(socket.readyState == WebSocket.CLOSING) {
                    await sleep(1000)
                }
                Init();
                var retrywave = 0;
                while(socket.readyState == WebSocket.CONNECTING && retrywave < 15) {
                    await sleep(1000)
                    retrywave +=1
                }
                if(retrywave >= 15) {
                    // Unable to reconnect :/
                    ShowMsg("Connection failed","Unable to connect back to the socket, please refresh your page and try again...","error")
                } else {
                    ShowMsg("Reconnected","The socket has been reconnected...","success")
                }
            }
        }
    }
})();