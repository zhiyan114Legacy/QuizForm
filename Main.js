particlesJS.load('particle', 'particle.conf.json', function() {})
$('.ui.radio.checkbox').checkbox();
$("#mainform").form({
    on: 'blur',
    fields: {
        Name: {
            identifier:"Name",
            rules: [
                {
                   type: 'empty',
                   prompt: "You need to put your name or you'll get a 0% LOL",
               }
            ]
        },
        q1:{
            identifier: "q1",
            rules:[
                {
                    type: 'checked',
                    prompt: "Question #1 is missing an answer",
                }
            ]
        },
        q2:{
            identifier: "q2",
            rules:[
                {
                    type: 'checked',
                    prompt: "Question #2 is missing an answer",
                }
              ]
        },
        q3:{
            identifier: "q3",
            rules:[
                {
                    type: 'checked',
                    prompt: "Question #3 is missing an answer",
                }
              ]
        },
        q4:{
            identifier: "q4",
            rules:[
                {
                    type: 'checked',
                    prompt: "Question #4 is missing an answer",
                }
            ]
        },
        q5:{
            identifier: "q5",
            rules:[
                {
                    type: 'checked',
                    prompt: "Question #5 is missing an answer",
                }
            ]
        }
    }
})
$("#mainform").on("submit", async function(e){
    e.preventDefault();
    if($("#mainform").form("is valid")) {
        var SubmitConfirm = await Swal.fire({
            title: "Turn In",
            icon: "question",
            text: "Are you sure that you're ready to turn it in?",
            showDenyButton: true,
            confirmButtonText: "Yup",
            denyButtonText: "Nope"
        })
        if(SubmitConfirm["isConfirmed"]) {
            // User Confirm to submit
            document.getElementById("submit").disabled = "true"
            document.getElementById("submit").style = "width: 1000px;cursor: not-allowed; pointer-events: all !important;"
            document.getElementById("Message").innerHTML = "Your answer is submitting, please do not navigate away..."
            var Result = await $.ajax({
                url: "https://QuizFormBackend.zhiyan114.repl.co/",
                type: "POST",
                data: JSON.stringify($("#mainform").serializeArray()),
                dataType: "json",
                contentType : "application/json",
                async:true              
            })
            document.getElementById("mainform").reset()
            document.getElementById("Message").innerHTML = "You got "+Result["Grade"]+"% on the quiz."
            await Swal.fire({
                title: "Result",
                icon: "success",
                text: "Congratulation, you got a "+Result["Grade"]+"% on the quiz. Now get rick rolled.",
                imageUrl: "https://quizformbackend.zhiyan114.repl.co/trollimg"
            })
        } else {
            // User declines to submit
            await Swal.fire({
                title: "Did Not Turn In",
                icon: "error",
                text: "You did not turn in the assignment. Please turn it in when you're ready."
            })
        }
    }
})