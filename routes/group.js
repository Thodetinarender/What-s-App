const express = require("express");

const groupController = require("../controllers/group");
const userAuthMiddleware = require("../middleware/auth");

const router = express.Router();

// to create a new group
router.post("/add", userAuthMiddleware.authenticate, groupController.newGrp);

// to add user to a group
router.post(
    "/:grpId/add-user",
    userAuthMiddleware.authenticate,
    groupController.addUser
);

// route to remove a user from the group
router.post(
    "/:grpId/remove-user",
    userAuthMiddleware.authenticate,
    groupController.deleteUser
);

// route to give users the admin privilege
router.post(
    "/:grpId/make-admin",
    userAuthMiddleware.authenticate,
    groupController.makeAdmin
);

router.get("/:grpId/is-admin", userAuthMiddleware.authenticate, groupController.isAdmin);


// route to edit name and desc of a group - later

module.exports = router;
