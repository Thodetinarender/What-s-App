const Group = require("../models/group");
const GroupMember = require("../models/groupMember");
const User = require("../models/user");

exports.createGroup = async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: "Group name is required!" });
    }

    try {
        const group = await Group.create({ name });
        res.status(201).json({ success: true, group });
    } catch (error) {
        console.error("Error creating group:", error);
        res.status(500).json({ error: "Server error! Please try again." });
    }
};

// ✅ Add a user to a group
exports.addMember = async (req, res) => {
    try {
        const { groupId, userId } = req.body;

        // Check if the group exists
        const group = await Group.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ success: false, error: "Group not found" });
        }

        // Check if the user exists
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        // Check if the user is already in the group
        const existingMember = await GroupMember.findOne({ where: { groupId, userId } });
        if (existingMember) {
            return res.status(400).json({ success: false, error: "User is already a member of this group" });
        }

        // Add the user to the group
        await GroupMember.create({ groupId, userId });

        res.json({ success: true, message: "Member added successfully" });
    } catch (error) {
        console.error("❌ Error adding member:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
};

// ✅ Remove a user from a group
exports.removeMember = async (req, res) => {
    try {
        const { groupId, userId } = req.body;

        // Check if the group exists
        const group = await Group.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ success: false, error: "Group not found" });
        }

        // Check if the user exists
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        // Check if the user is in the group
        const member = await GroupMember.findOne({ where: { groupId, userId } });
        if (!member) {
            return res.status(400).json({ success: false, error: "User is not a member of this group" });
        }

        // Remove the user from the group
        await GroupMember.destroy({ where: { groupId, userId } });

        res.json({ success: true, message: "Member removed successfully" });
    } catch (error) {
        console.error("❌ Error removing member:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
};

// ✅ List all members in a group
exports.listGroupMembers = async (req, res) => {
    try {
        const { groupId } = req.params;

        const group = await Group.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ success: false, error: "Group not found" });
        }

        const members = await GroupMember.findAll({
            where: { groupId },
            include: [{ model: User, attributes: ["id", "name", "email"] }]
        });

        if (!members.length) {
            return res.json({ success: true, members: [] });
        }

        const formattedMembers = members.map(member => ({
            id: member.User?.id || null,
            name: member.User?.name || "Unknown",
            email: member.User?.email || "Unknown"
        }));

        res.json({ success: true, members: formattedMembers });
    } catch (error) {
        console.error("❌ Error fetching group members:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
};

// ✅ Check if a user is in a group
exports.checkUserInGroup = async (req, res) => {
    try {
        const { groupId, userId } = req.params;

        // Check if the user is in the group
        const member = await GroupMember.findOne({ where: { groupId, userId } });

        res.json({ success: true, isMember: !!member });
    } catch (error) {
        console.error("❌ Error checking user in group:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
};


exports.getGroups = async (req, res) => {
    try {
        const groups = await Group.findAll();
        res.status(200).json({ success: true, groups });
    } catch (error) {
        console.error("Error fetching groups:", error);
        res.status(500).json({ error: "Server error! Please try again." });
    }
};

exports.checkUser = async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: "User ID is required!" });
    }

    try {
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found!" });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error("Error checking user:", error);
        res.status(500).json({ error: "Server error! Please try again." });
    }
};