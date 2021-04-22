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
document.getElementById("reset").onclick = async function() {
    var DoReset = await Swal.fire({
        title: "Clear Form",
        text: "Are you sure you want to clear all of your data?",
        showDenyButton: true,
        icon: 'warning',
    })["isConfirmed"]
    if(DoReset) {
        Swal.fire({
            title: "Clear Form",
            text: "Not sure why you would do that but your form has been cleared."
        })
    }
    return DoReset
}
document.getElementById("submit").onclick = async function() {
    return await Swal.fire({
        title: "Submit",
        text: "Are you sure that you want to turn in your answers?",
        showDenyButton: true,
        icon: 'question',
    })["isConfirmed"]
}