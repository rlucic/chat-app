//define an array for users
const users = []



/**
 * add an user to the room
 *             destructure the user object (as arguments)
 * 
 * @param {*} param0 
 */
const addUser = ({id, username, room}) => {
    //validate the data
    if(!username || !room){
        return {
            error: 'Username and room are required'
        }
    }

    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //check for existent user in the same room
    //find has access to the current user in the array and returns the user if the condition is true
    const existingUser = users.find( (user) => {
        //return true if an user exists in the room
        return (user.room === room) && (user.username === username)
    })

    if (existingUser){
        return {
            error: 'Exiting user in the room'
        }
    }

    const user = {id, username, room}
    users.push(user)
    return {
        user
    }
}


/**
 * Remove an user from a room
 * 
 */
const removeUser =(id) => {
    if(id <= 0){
        return {
            error: 'only positive numbers'
        }
    }

    const index = users.findIndex((user) => {
        return (id === user.id)
    })

    if(index !== -1){
        //remove and return the user from the index position in an array
        return users.splice(index, 1)[0]
    }
}

/**
 * find an user in the array and return it
 * 
 * @param {*} id 
 */
const getUser = (id) => {
    if(id <= 0){
        return undefined
    }

    const userFound = users.find( (user) => user.id === id )
    return userFound

}

/**
 * return all the users in the room
 * 
 * 
 * @param {*} room 
 */
const getUsersInRoom = (room) => {
    if(!room){
        return []
    }

    const usersInRoom = users.filter( (user) => user.room===room)
    return usersInRoom
}


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
/*

//testing the function
addUser({
    id: 11, 
    username: 'Bula', 
    room: '  r22##'})

addUser({
    id: 12, 
    username: 'Mike', 
    room: '  r22##'})

addUser({
    id: 20, 
    username: 'Bob', 
    room: '  r33##'})
console.log(users)


const res = addUser({
    id: 12, 
    username: '', 
    room: '  r22##'})

console.log(res)

// removeUser(11)
// console.log(users)
console.log(getUser(201))
console.log(getUser(20))

console.log(getUsersInRoom('r22##'))
console.log(getUsersInRoom('r33##'))
console.log(getUsersInRoom('r33#'))
*/