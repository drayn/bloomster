// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('../..')(server);
var port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
  console.log('waiting for user %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

// Chatroom


var locationUserDictionary = [][][];


// usernames which are currently connected to the chat
var usernames = {};
var numUsers = 0;

io.on('connection', function (socket) {
console.log('a user connected');
  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    
    location = socket.location;
    
    userDictionary = locationUserDictionary[location];
    if(typeof userDictionary === "undefined")
    {
    	console.log('no userDictionary for location %s. creating it', location);
    	userDictionary = [][];
    	locationUserDictionary.push({
    		key: location,
    		value: userDictionary
    		});
    }
      
        
    socket.to(location).broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (data) {
  
  username = data.name;
  location = data.location;
  
  userDictionary.push(
  {
  	key: username,
  	value: username
  });
  
  console.log('data connected %s', data); 
  
console.log('username connected %s', username);  
console.log('at location : %s', location);  
  
    // we store the username in the socket session for this client
    socket.username = username;
    socket.location = location;
    socket.join(location);
    // add the client's username to the global list
    usernames[username] = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.to(location).emit('user joined', {
      username: socket.username,
      numUsers: numUsers,
      rooms: location
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    // remove the username from global usernames list
    if (addedUser) {
      delete usernames[socket.username];
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
    
    console.log('user %s disconnect from %s', socket.username, socket.location); 
    
  });
});
