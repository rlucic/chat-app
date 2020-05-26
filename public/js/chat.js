//to connect to the server:
const socket = io()

socket.on('countUpdated', (count) => {
    console.log('The count has been updated now', count)
})

//attach an event listener for the button in the page
document.querySelector('#increment').addEventListener('click', () => {
    console.log('Clicked')
    //when clicked, emit an event to the server
    socket.emit('increment')
})