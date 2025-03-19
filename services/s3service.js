const AWS = require("aws-sdk");

exports.uploadToS3 = async (data, fileName) => {
    const BUCKET_NAME = process.env.BUCKET_NAME;
    const IAM_USER_KEY = process.env.IAM_USER_KEY;
    const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

    let s3Bucket = new AWS.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET,
    });

    var params = {
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: data,
        ACL: "public-read",
    };
    return new Promise((resolve, reject) => {
        s3Bucket.upload(params, (err, s3response) => {
            if (err) {
                console.log("Something went wrong", err);
                reject(err);
            } else {
                console.log("success", s3response.Location);
                resolve(s3response.Location);
            }
        });
    });
};
