//
const admin = require("@azure/communication-administration");
const common = require("@azure/communication-common");
const mongoose = require("mongoose");

const CONNECTION_STRING = "<Your Connection String>";

// Defining UserSchema, then the Administrator class
const UserSchema = new mongoose.Schema({
    name: String,
    userId: String,
    token: String,
    // expDate: Date,
    voip: Boolean,
    pstn: Boolean,
    chat: Boolean
})

const User = mongoose.model("User", UserSchema);

// The Administrator class does exactly what it sounds like. You can use it to create, delete, or otherwise modify
// Users.
module.exports = class Administrator{
    constructor() {
        
        mongoose.connect("mongodb://localhost/testCase", {
            useNewUrlParser:true,
            useUnifiedTopology: true,
        }).then(() => console.log("established connection to db"))
        .catch(err => console.log("Something went wrong: ", err));
        
        this.identityClient = new admin.CommunicationIdentityClient(CONNECTION_STRING,);
        
    }
    
    scopeBuild(voip, pstn, chat){
        let all_scopes = [];
        if(voip){
            all_scopes.push("voip");
        }
        if(pstn){
            all_scopes.push("pstn");
        }
        if(chat){
            all_scopes.push("chat");
        }
        return all_scopes;
    }

    async createUser(name = "Default Paul", scopes = [true, false, false]){
        //Here we create a user and a token for them by default.  We then store that user, username, and token
        //in our MongoDB
        console.log("Creating user now!");
        
        // console.log(all_scopes);
        let identityResponse = await this.identityClient.createUser();
        console.log(identityResponse);
        let tokenResponse = await this.identityClient.issueToken(identityResponse, this.scopeBuild(scopes[0], scopes[1], scopes[2]));

        // adding user to DB
        User.create({
            name : name,
            userId : identityResponse.communicationUserId,
            token : tokenResponse.token,
            // expDate : tokenResponse.expiresOn,
            voip: scopes[0],
            pstn: scopes[1],
            chat: scopes[2]
        }).then(newUser => console.log("user made", newUser))
          .catch(error => console.log("Something went wrong:", error))
    }

    async getUsers(){
        console.log("Getting all users");
        let all_users = await User.find();
        // console.log(all_users);
        return all_users;
    }

    async refreshUser(user){
        console.log("Fetching User");
        console.log(user)

        // find user by ID.
        let db_user = await User.findById(user._id);

        console.log("Building User Profile");

        let tokenResponse = await this.identityClient.issueToken({communicationUserId:user.userId}, this.scopeBuild(user.voip, user.pstn, user.chat));
        // save changes to User document
        db_user.token = tokenResponse.token;
        await db_user.save();

        return;
    }

}


// Needed for UserSchema
// Name,
// UserID,
// Token,
// ExpirationDate,
// Scopes