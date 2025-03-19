const Message = require("../models/message");
const Group = require("../models/group");
const GroupUser = require("../models/groupUser");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });


// Get all groups the user is a member of
exports.getAllGrps = async (req, res, next) => {
    try {
        const myGrpIds = await GroupUser.findAll({
            attributes: ["groupId"],
            where: { userId: req.user.id },
        });
        const allGrps = myGrpIds.map(grp => grp.groupId);

        const grps = await Group.findAll({
            attributes: ["id", "name", "description"],
            where: { id: allGrps },
        });

        res.status(200).json({ data: grps });
    } catch (err) {
        res.status(404).json({ message: "You are in no groups" });
    }
};

// Get all messages from a group
exports.getGrpMessages = async (req, res) => {
    const grpId = req.params.grpId;
    try {
        const messages = await Message.findAll({
            attributes: ["id", "userId", "content", "createdAt"],
            order: [["createdAt", "DESC"]],
            where: { groupId: grpId },
        });

        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ message: err });
    }
};

// Post a text message
exports.postMessage = async (req, res) => {
    const { message, grpId } = req.body;
    try {
        await Message.create({
            content: message,
            userId: req.user.id,
            groupId: grpId,
        });

        res.status(201).json({ message: "Message sent successfully", success: true });
    } catch (err) {
        res.status(500).json({ message: err });
    }
};

// Post a media file
exports.postMedia = async (req, res) => {
    const grpId = req.body.grpId;

    if (!req.file) {
        return res.status(400).json({ message: "Please choose a file" });
    }

    const filePath = `/uploads/${req.file.filename}`;

    try {
        await Message.create({
            content: filePath,
            userId: req.user.id,
            groupId: grpId,
        });

        res.status(201).json({
            message: "Media uploaded successfully",
            fileUrl: filePath,
            success: true,
        });
    } catch (err) {
        res.status(500).json({ message: err });
    }
};

















// const Message = require("../models/message");
// const Group = require("../models/group");
// const GroupUser = require("../models/groupUser");
// //const AWS = require("aws-sdk");
// const fs = require("fs");
// const path = require("path");

// // get all groups the user is a member of
// exports.getAllGrps = async (req, res, next) => {
//     try {
//         const myGrpIds = await GroupUser.findAll({
//             attributes: ["groupId"],
//             where: { userId: req.user.id },
//         });
//         const allGrps = [];
//         for (let i = 0; i < myGrpIds.length; i++) {
//             allGrps.push(myGrpIds[i].groupId);
//         }
//         const grps = await Group.findAll({
//             attributes: ["id", "name", "description"],
//             where: { id: allGrps },
//         });
//         res.status(200).json({ data: grps });
//     } catch (err) {
//         res.status(404).json({ message: "You are in no groups" });
//     }
// };

// exports.getGrpMessages = async (req, res) => {
//     const grpId = req.params.grpId;
//     // check whether the user is in that group here - later
//     try {
//         const messages = await Message.findAll({
//             attributes: ["id", "userId", "content", "createdAt"],
//             order: [["createdAt", "DESC"]],
//             where: { groupId: grpId },
//         });
//         res.status(200).json(messages);
//     } catch (err) {
//         res.status(500).json({ message: err });
//     }
// };

// exports.postMessage = async (req, res) => {
//     const message = req.body.message;
//     const grpId = req.body.grpId;
//     try {
//         await Message.create({
//             content: message,
//             userId: req.user.id,
//             groupId: grpId,
//         });
//         res.status(201).json({
//             message: "message sent successfully",
//             success: true,
//         });
//     } catch (err) {
//         res.status(500).json({ message: err });
//     }
// };

// const uploadToS3 = async (file, userId) => {
//     const fileStream = fs.createReadStream(file.path);
//     const fileName =
//         String(userId) + "-" + new Date().toISOString() + file.originalname;

//     let s3Bucket = new AWS.S3({
//         accessKeyId: process.env.USER_KEY,
//         secretAccessKey: process.env.USER_SECRET,
//     });

//     const params = {
//         Bucket: process.env.BUCKET_NAME,
//         Key: fileName,
//         Body: fileStream,
//         ACL: "public-read",
//     };

//     return new Promise((resolve, reject) => {
//         s3Bucket.upload(params, (err, s3response) => {
//             if (err) {
//                 console.log("Something went wrong", err);
//                 reject(err);
//             } else {
//                 console.log("success", s3response.Location);
//                 resolve(s3response.Location);
//             }
//         });
//     });
// };

// exports.postMedia = async (req, res) => {
//     // get image and group id from frontend
//     const grpId = req.body.grpId;
//     if (req.file == null) {
//         return res.status(400).json({ message: "Please choose the file" });
//     }
//     var file = req.file;

//     // upload to S3
//     const fileUrl = await uploadToS3(file, req.user.id);

//     // delete the files from server
//     const directory = "uploads";
//     fs.readdir(directory, (err, files) => {
//         if (err) throw err;

//         for (const file of files) {
//             fs.unlink(path.join(directory, file), (err) => {
//                 if (err) throw err;
//             });
//         }
//     });

//     // send the message
//     try {
//         await Message.create({
//             content: fileUrl,
//             userId: req.user.id,
//             groupId: grpId,
//         });
//         console.log(fileUrl);
//         res.status(201).json({
//             message: "message sent successfully",
//             fileUrl: fileUrl,
//             success: true,
//         });
//     } catch (err) {
//         res.status(500).json({ message: err });
//     }
// };
