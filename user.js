const { User } = require('../models/user/index');
const _ = require('lodash');
const upload = require('../formidable')
const formidable = require('formidable');

//Register
module.exports = (function () {
    return {
        register: function (req, res) {
            var body = _.pick(req.body, ['email', 'username', 'contactNumber', 'password']);
            User.findOne({ email: body.email }).then((user) => {
                if (user) {

                    res.status(400).send({ "message": "User with that emailid already exists" })
                }
            }).catch((err) => {
                return res.status(400).send(err);
            });
            var user = new User(body);
            user.generateAuthToken().then((token) => {
                user.token = token;
                res.status(200).send(user);
            }).catch((err) => {
                return res.status(400).send(err);
            });
        },

        //Login
        login: function (req, res) {
            var body = _.pick(req.body, ['email', 'password']);

            User.findByCredentials(body.email, body.password).then((user) => {
                return user.generateAuthToken().then((token) => {
                    user.token = token;
                    var user_arr = []
                    user_arr.push(user.email, user.username, user.token)
                    user.save();
                    res.send(user_arr);
                });
            }).catch((err) => {
                return res.status(400).send(err);
            });
        },

        //Set the profile Picture
        uploadPicture: function (req, Response) {
            var token = req.header('Authorization');

            User.findByToken(token).then((user) => {
                if (!user)
                     Response.status(400).send({ "message": "Invalid user" })
                var form = new formidable.IncomingForm();
                form.uploadDir = "./uploads";
                form.maxFileSize = 10*1024*1024;
                form.multiples = true;
                form.keepExtensions = true;
                form.parse(req, (err, fields, files) => {
                    if(err){
                        Response.json({
                            result: "failed",
                            data: {},
                            message: `Cannot upload images. Error is ${err}`
                        })
                    }
                    var arrayOfFiles = files[""];
                    if(arrayOfFiles.length > 0){
                        var filesNames = [];
                        arrayOfFiles.forEach(element => {
                            filesNames.push(element.path.split('/')[1])
                        });
                        Response.json({
                            result: "success",
                            data: {},
                            numberOfImages: 0,
                            message: "image uploaded successfully"
                        })
                    }else{
                        Response.json({
                            result: "failed",
                            data: {},
                            numberOfImages: 0,
                            message: "No images to upload"
                        })

                    }
                })
            }).catch((err) => {
                 Response.status(400).send(err);
            })
        },
        // pictures: function(req, res){


        // },

        //Get User details
        details: function (req, res) {
            var token = req.header('Authorization');

            User.findByToken(token).then((user) => {
                if (!user)
                    return res.status(400).send({ "message": "Invalid user" });
                var user_arr = []
                user_arr.push(user.email, user.username, user.contactNumber, user.profilePicture);
                res.status(200).send(user_arr);
            }).catch((err) => {
                return res.status(400).send(err);
            })
        },

        //Logout
        logout: function (req, res) {
            var token = req.header('Authorization');

            if (!token)
                res.status(401).send();
            User.findOneAndUpdate({ token }, { $set: { token: "" } }).then((user) => {
                if (!user)
                    res.status(404).send("No such user exists.");
                res.send({ "message": "Logged out" })
            }).catch((err) => {
                return res.status(400).send(err);
            });
        }
    }
}());
