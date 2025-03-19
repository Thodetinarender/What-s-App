const jwt = require("jsonwebtoken");

exports.generateAccessTokenOnPremium = (id, name, isPremium) => {
    return jwt.sign(
        { userId: id, name: name, isPremium: isPremium },
        process.env.JWT_SECRET
    );
};

exports.generateAccessTokenOnLogin = (id, name) => {
    return jwt.sign({ userId: id, name: name }, process.env.JWT_SECRET);
};
