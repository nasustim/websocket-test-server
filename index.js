const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)

const data = require('./configure')

app.get('/', function(req, res){
    res.send(`
    <p>success</p>
    <a href="/from_master_req"><button>サーバからwebsocketを送ってもらうリクエスト</button></a>
    <button onclick="fromSlave();">クライアントからwebsocketを送る</button>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.2.0/socket.io.slim.js"></script>
    <script>
        var socket = io()
        socket.on('fromMaster', function(data){
            console.log(data)
        });
        function fromSlave (){
            socket.emit('fromSlave', 'from slave: ' + Date.now());
            console.log('from slave: ' + Date.now())
        }
    </script>
    `)
})

io.on('connection', function(socket){
    let loginUsers = []

    socket.on('login', function(user){
    })

    socket.on('fromSlave', function(req){
        console.log(req)
        io.emit('fromMaster', 'from slave loop: ' + Date.now())
    })
})

app.get('/from_master_req',function(req, res){
    console.log('from master: ' + Date.now())
    io.emit('fromMaster', 'from master: ' + Date.now())
})

http.listen(data.port, function(){
    console.log('This server is listening on localhost:' + data.port)
})