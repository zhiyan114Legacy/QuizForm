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