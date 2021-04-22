particlesJS.load('particle', 'particle.conf.json', function() {})
var MissingAnswer = "Please pick an answer."
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
                    prompt: MissingAnswer,
                }
            ]
        },
        q2:{
            identifier: "q2",
            rules:[
                {
                    type: 'checked',
                    prompt: MissingAnswer,
                }
              ]
        },
        q3:{
            identifier: "q3",
            rules:[
                {
                    type: 'checked',
                    prompt: MissingAnswer,
                }
              ]
        },
        q4:{
            identifier: "q4",
            rules:[
                {
                    type: 'checked',
                    prompt: MissingAnswer,
                }
            ]
        },
        q5:{
            identifier: "q5",
            rules:[
                {
                    type: 'checked',
                    prompt: MissingAnswer,
                }
            ]
        }
    }
})