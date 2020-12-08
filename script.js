const socket = io('http://localhost:3000');

//Elements
document.getElementById("create_button").onclick = createUser;
document.getElementById("get_users").onclick = getUsers;
let allRefreshButtons = [];
let allUsers = [];

let table = document.getElementById("table_body");

socket.on("connect-test", data => {
    console.log("Message from server");
    console.log(data);
})

socket.on("users_data", data => {
    console.log("User data");
    table.innerHTML = "";
    data = JSON.parse(data);
    data.forEach((doc, index) => {
        let example = `<tr><td>${doc.name}</td><td>${doc.userId}</td><td>These are big</td><td>${doc.voip}</td><td>${doc.pstn}</td><td>${doc.chat}</td><td><button class="refresh_button" value=${index}>Refresh</button></td></tr>`;
        console.log("loop");
        table.innerHTML += example;
    });
    
    console.log(data);
    allUsers = data;
    allRefreshButtons = document.getElementsByClassName("refresh_button");

    for(let x = 0; x < allRefreshButtons.length; x++){
        allRefreshButtons[x].onclick = refreshTest;
    }
})

socket.on("refresh_complete", () => {
    console.log("refresh complete");
    getUsers();
})

function createUser(){
    console.log("Sending Create Request");
    let user = {username:"", voip:false, pstn:false, chat:false};
    user.username = document.getElementById("user_name").value;
    user.voip = document.getElementById("voip_check").checked;
    user.pstn = document.getElementById("pstn_check").checked;
    user.chat = document.getElementById("chat_check").checked;
    console.log(user);
    socket.emit("create_user", JSON.stringify(user));
}

function getUsers(){
    console.log("Requesting all users");
    socket.emit("get_users", null);
}

function refreshTest(value){
    console.log('refresh punched');
    let target_user = allUsers[this.value];
    console.log(target_user);
    socket.emit('refresh_user', JSON.stringify(allUsers[this.value]));
    console.log(this.value);
}