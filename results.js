var updateList = async function() {
    const Display = document.getElementById("display")
    document.getElementById("reload").disabled = "true"
    document.getElementById("reload").style = "cursor: not-allowed; pointer-events: all !important;"
    const Result = await $.ajax({
        url: "https://quizformbackend.zhiyan114.repl.co/results",
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
      const Rating = document.createElement("td")
      DisplayName.appendChild(document.createTextNode(data[0]))
      Score.appendChild(document.createTextNode(data[1]+"%"))
      Rating.appendChild(document.createTextNode(data[2]))
      Row.appendChild(DisplayName)
      Row.appendChild(Score)
      Row.appendChild(Rating)
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
  $("#emailreq").form({
    fields: {
      Email: {
        identifier:"Email",
        rules: [
            {
               type: 'email',
               prompt: "Please enter a valid email.",
           }
        ]
      },
    }
  })
  $("#emailreq").on("submit", async function(e){
    e.preventDefault();
    if($("#emailreq").form("is valid")) {
      document.getElementById("Message").innerHTML = "Sending Request, please wait..."
      document.getElementById("submitreq").disabled = "true"
      document.getElementById("submitreq").style = "cursor: not-allowed; pointer-events: all !important;"
      const Result = await $.ajax({
        url: "https://quizformbackend.zhiyan114.repl.co/results",
        type: "POST",
        data: JSON.stringify({"Email":document.getElementById("Email").value}),
        dataType: "json",
        contentType : "application/json",
        async:true              
      });
      if(Result["success"]) {
        await Swal.fire({
          title: "Success",
          icon: "success",
          text: `A copy of the result has been successfully sent to the email: ${document.getElementById("Email").value}.`,
        })
        document.getElementById("Message").innerHTML = "The last request was successful."
      } else {
        await Swal.fire({
          title: "Failed",
          icon: "error",
          text: "There was an error while sending the email. Maybe a typo?"
        })
        document.getElementById("Message").innerHTML = "The last request was not successful."
      }
      $("#submitreq").removeAttr("disabled");
      document.getElementById("Email").value = "";
      document.getElementById("submitreq").style = "";
    };
  })