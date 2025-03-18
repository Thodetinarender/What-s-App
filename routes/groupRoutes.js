const express = require("express");
const groupController = require("../Controllers/groupController");
const chatController = require("../Controllers/chatController");
const Group = require("../models/group");
const GroupMember = require("../models/groupMember");
const User = require("../models/user");

const router = express.Router();

router.post("/create", groupController.createGroup);
router.post("/add-member", groupController.addMember);
router.get("/list", groupController.getGroups);
router.post("/check-user", groupController.checkUser);
router.get("/:groupId/messages", chatController.getGroupChatHistory);
router.get("/group/:groupId/messages", chatController.getGroupChatHistory);
// ✅ Add a member
router.post("/add-member", groupController.addMember);

// ✅ Remove a member
router.post("/remove-member", groupController.removeMember);

// ✅ List group members
router.get("/:groupId/members", groupController.listGroupMembers);

// ✅ Check if user is in a group
router.get("/:groupId/check-member/:userId", groupController.checkUserInGroup);


router.get("/:groupId/members", async (req, res) => {
    const { groupId } = req.params;
    try {
        const members = await GroupMember.findAll({
            where: { groupId },
            include: { model: User, attributes: ["id", "name"] }
        });

        res.json({ success: true, members: members.map(m => m.User) });
    } catch (error) {
        console.error("❌ Error fetching group members:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});



module.exports = router;