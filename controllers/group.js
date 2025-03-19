const Group = require("../models/group");
const Message = require("../models/message");
const User = require("../models/user");
const GroupUser = require("../models/groupUser");

// create new group and add the admin as a group member
exports.newGrp = async (req, res, next) => {
    const name = req.body.grpName;
    const desc = req.body.desc;

    try {
        const grp = await req.user.createGroup({
            name: name,
            description: desc,
            adminId: req.user.id,
        });

        await grp.addUser(req.user.id);

        res.status(201).json({
            message: "Group successfully created",
            sucecss: true,
        });
    } catch (err) {
        res.json({ error: err });
    }
};

// add new member to the group only if you are an admin
exports.addUser = async (req, res, next) => {
    const grpId = req.body.grpId;
    const userId = req.body.userId;
    try {
        const currentUser = await GroupUser.findOne({
            where: { userId: req.user.id, groupId: grpId },
        });
        const grp = await Group.findOne({ where: { id: grpId } });
        if (grp.adminId === req.user.id || currentUser.admin === true) {
            const user = await grp.getUsers({ where: { id: userId } });
            if (user.length === 0) {
                await grp.addUser(userId);
                res.status(200).json({ message: "User added", sucecss: true });
            } else {
                res.json({ message: "User already in group" });
            }
        }
    } catch (err) {
        res.json(401).json({ message: err });
    }
};

// remove an user from the group only if you are an admin
exports.deleteUser = async (req, res, next) => {
    const grpId = req.body.grpId;
    const userId = req.body.userId;
    try {
        const currentUser = await GroupUser.findOne({
            where: { userId: req.user.id, groupId: grpId },
        });
        const grp = await Group.findOne({ where: { id: grpId } });
        if (
            (grp.adminId === req.user.id || currentUser.admin === true) &&
            Number(userId) !== grp.adminId
        ) {
            const user = await grp.getUsers({ where: { id: userId } });
            if (user.length !== 0) {
                await grp.removeUser(userId);
                res.status(200).json({ message: "User added", sucecss: true });
            } else {
                res.json({ message: "User not present in the group!" });
            }
        }
    } catch (err) {
        res.json({ message: err });
    }
};

// Give admin privileges to members
exports.makeAdmin = async (req, res, next) => {
    const grpId = req.body.grpId;
    const userId = req.body.userId;

    try {
        const currentUser = await GroupUser.findOne({
            where: { userId: req.user.id, groupId: grpId },
        });
        const grp = await Group.findOne({ where: { id: grpId } });

        // Only the creator of the group or an existing admin can give privileges
        if (grp.adminId === req.user.id || (currentUser && currentUser.admin === true)) {
            const target = await GroupUser.findOne({
                where: { userId: userId, groupId: grpId },
            });

            if (!target) {
                return res.status(404).json({ message: "User not found in group" });
            }

            target.admin = true;
            await target.save();

            // ✅ Return a success response
            return res.status(200).json({ message: "User promoted to admin" });
        } else {
            return res.status(403).json({ message: "Unauthorized to make admin" });
        }
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err });
    }
};



exports.isAdmin = async (req, res) => {
    const grpId = req.params.grpId;

    try {
        const group = await Group.findOne({ where: { id: grpId } });
        const currentUser = await GroupUser.findOne({
            where: { userId: req.user.id, groupId: grpId },
        });

        if (group.adminId === req.user.id || (currentUser && currentUser.admin)) {
            return res.status(200).json({ isAdmin: true });
        }

        res.status(200).json({ isAdmin: false });
    } catch (error) {
        res.status(500).json({ message: "Error checking admin status" });
    }
};
