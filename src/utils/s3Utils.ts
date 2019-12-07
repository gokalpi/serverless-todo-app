const AWSXRay = require("aws-xray-sdk-core");
const XAWS = AWSXRay.captureAWS(require("aws-sdk"));

const bucketName = process.env.IMAGES_S3_BUCKET;
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION);

const s3 = new XAWS.S3({
  signatureVersion: "v4"
});

export async function getSignedUrl(todoId: string): Promise<string> {
  return s3.getSignedUrl("putObject", {
    Bucket: bucketName,
    Key: todoId,
    Expires: urlExpiration
  });
}

export async function getAttachmentUrl(todoId: string): Promise<string> {
  return `https://${bucketName}.s3.amazonaws.com/${todoId}`;
}
