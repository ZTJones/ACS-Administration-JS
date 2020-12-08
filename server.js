const admin = require("./admin.js");

const Administrator = new admin();

const io = require('socket.io')(3000, {
    cors: {
        origin: "http://localhost:5500",
        methods: ["GET", "POST"]
    }
});

io.on("connection", socket => {
    console.log("Connection established");
    socket.emit('connect-test', "Connection established");

    socket.on("create_user", data => {
        console.log("Request to create user has come in");
        data = JSON.parse(data);
        let dataScopes = [data.voip, data.pstn, data.chat];
        Administrator.createUser(name = data.username, scopes = dataScopes);
    });

    socket.on("get_users", async () => {
        console.log("Request for all user data has come in");
        let all_users = await Administrator.getUsers();
        all_users = JSON.stringify(all_users);
        // console.log(all_users);
        socket.emit('users_data', all_users);
    });

    socket.on("refresh_user", async (data) => {
        console.log("A request to refresh a user's token has come in");
        data = JSON.parse(data);
        Administrator.refreshUser(data);
        socket.emit('refresh_complete', null);
    })

    
})