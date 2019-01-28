const app = require('express')()
const bodyParser = require('body-parser')
const http = require('http').Server(app)
const io = require('socket.io')(http)

const data = require('./configure')

const registedUsers = data.registedUsers
let loginedUsers = []

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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

app.post('/login', function(req, res){

    cli_user = req.body

    const loginableUser = registedUsers.filter((rgd_user) => 
        rgd_user.loginId == cli_user.id && rgd_user.password == cli_user.pass)

    let result
    if(loginableUser.length == 1){
        result = 'ok'
        loginedUsers.push( loginableUser[0].id )
    }else if(loginableUser.length == 0){
        result = 'IDまたはパスワードが違います。'
    }else{
        result = '認証エラーが発生しました。システム管理者にお問い合わせください。' 
    }

    res.json({
        result: result
    })
})

io.on('connection', function(socket){

    socket.on('login', function(cli_user){
        const loginableUser = registedUsers.filter((rgd_user) => 
            rgd_user.loginId == cli_user.id && rgd_user.password == cli_user.pass)

        let result
        if(loginableUser.length == 1){
            result = 'ok'
            loginedUsers.push( loginableUser[0].id )
        }else if(loginableUser.length == 0){
            result = 'IDまたはパスワードが違います。'
        }else{
            result = '認証エラーが発生しました。システム管理者にお問い合わせください。' 
        }

        console.log(result)
        io.emit('loginResult', result)
    })

    socket.on('fromSlave', function(req){
        console.log(req)
        io.emit('fromMaster', 'from slave loop: ' + Date.now())
    })

    socket.on('disconnected', function(e){
        console.log(e)
    })
})

app.get('/from_master_req',function(req, res){
    console.log('from master: ' + Date.now())
    io.emit('fromMaster', 'from master: ' + Date.now())
})

http.listen(data.port, function(){
    console.log('This server is listening on localhost:' + data.port)
})
