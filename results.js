var updateList = async function() {
    const Display = document.getElementById("display")
    document.getElementById("reload").disabled = "true"
    document.getElementById("reload").style = "cursor: not-allowed; pointer-events: all !important;"
    const Result = await $.ajax({
        url: "wss://quizformbackend.zhiyan114.com/answer",
        type: "GET",
        data: "",
        dataType: "json",
        contentType : "application/json",
        async:true              
    });
    while (Display.firstChild) {
      Display.removeChild(Display.lastChild);
    }
    Result.forEach((data)=>{
      const Row = document.createElement("tr")
      const DisplayName = document.createElement("td")
      const Score = document.createElement("td")
      DisplayName.appendChild(document.createTextNode(data[0]))
      Score.appendChild(document.createTextNode(data[1]+"%"))
      Row.appendChild(DisplayName)
      Row.appendChild(Score)
      Display.appendChild(Row)
    })
    $('#statboard').tablesort()
    $("#reload").removeAttr("disabled")
    document.getElementById("reload").style = "";
  }
  document.getElementById("reload").onclick = updateList
  particlesJS.load('particle', 'particle.conf.json', function() {
    updateList();
  })