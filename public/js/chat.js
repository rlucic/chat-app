//Elements
const $messageForm = document.querySelector('#f1')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $urls = document.querySelector('#urls')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})


//to connect to the server:
const socket = io()

socket.on('message', (text) => {
    console.log(text)
    //display messages below
    const html = Mustache.render(messageTemplate, {
        message: text.text,
        createdAt: moment(text.createdAt).format('hh:mm:ss a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('sendLocation', (locationMessage) => {
    console.log(locationMessage)
    const html = Mustache.render(locationMessageTemplate, {
        theURL: locationMessage.theURL,
        createdAt: moment(locationMessage.createdAt).format('hh:mm:ss a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})


$messageForm.addEventListener('submit', (e)=> {
    e.preventDefault()
   //disable form
    $messageFormButton.setAttribute('disabled', 'disabled')
    //we have access to the event to the targeg = form, and the elements in the form: elements, and by element name: message
    let message = e.target.elements.message.value
    //console.log(message)
    //             event        arguments,  callback function to run when the emitter receives the acknowledgement
    socket.emit('sendMessage', message, (profanity) => {
        //enable form
        $messageFormButton.removeAttribute('disabled')
        //set value and focus on the text
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (profanity){
            return console.log(profanity)
        }
        console.log('The message was delivered')
        
    })

})

$sendLocationButton.addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('Browser does not support geolocation')
    }
    $sendLocationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition( (position) => {
        //console.log(position)
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude

        //socket.emit('sendLocation', {'latitude': latitude, 'longitude': longitude})
        socket.emit('sendLocation', {'latitude': latitude, 'longitude': longitude}, () => {
            //acknowledgement callback function
            console.log('Location shared')
            $sendLocationButton.removeAttribute('disabled')
        })
    })
})

//emit a new event when someone joins, username and room are shortcuts for name: name
socket.emit('join', {username, room})
