const express = require("express");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require("cors");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const dotenv = require('dotenv');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors("*"));
app.use(fileUpload({
    useTempFiles: true
}));

dotenv.config();

cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret
});

const date = `${new Date().getDate()}/${new Date().getMonth}/${new Date().getFullYear()}`;

const blogSchema = new mongoose.Schema({
    Name: { type: String },
    Location: { type: String },
    Description: { type: String },
    Image: { type: String },
    date: { type: Date, default: date },
    likes: { type: Number, default: 0 }
});

const Blog = mongoose.model('blogs', blogSchema);

app.post("/store-data", async (req, res) => {
    try {
        cloudinary.uploader.upload(req.files.image.tempFilePath, async (err, result) => {
            await Blog.create({
                "Name": req.body.name,
                "Location": req.body.Location,
                "Description": req.body.Description,
                "Image": result.url
            });
        })
    } catch (e) {
        res.json({
            status: "Failed",
            message: e.message
        })
    }
});

app.get("/store-data", async (req, res) => {
    try {
        let data = await Blog.find();
        data = data.reverse();
        res.json(data);
    } catch (e) {
        res.status(500).json({
            status: "Failed",
            message: e.message
        });
    }
});

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true }, () => {
    console.log('connected to DB')
});

app.listen(4000, () => {
    console.log("Server running successfully on 4000");
});