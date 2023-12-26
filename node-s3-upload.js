const {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  S3Client
} = require("@aws-sdk/client-s3")

const BUCKET_NAME = "my-bucketé
const BUCKET_REGION = "eu-west-3"

const client = new S3Client({
  region: BUCKET_REGION,
  credentials: {
    accessKeyId: "AAAAAAAAAAAAAAAAAAAAAAAA",
    secretAccessKey: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
  }
})

module.exports = {
  async getFile(fileName) {
    const response = await client.send(
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileName
      })
    )
    const stream = response.Body
    return new Promise((resolve, reject) => {
      const chunks = []
      stream.on("data", chunk => chunks.push(chunk))
      stream.once("end", () => resolve(Buffer.concat(chunks).toString("utf-8")))
      stream.once("error", reject)
    })
  },
  async saveFile(fileName, content) {
    await client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: Buffer.from(content),
        ContentType: "application/json",
        ACL: "public-read"
      })
    )
  },
  async listFiles(fileName) {
    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: BUCKET_NAME
      })
    )
    return response.Contents.map(i => i.Key)
  },
  async deleteFile(fileName) {
    await client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileName
      })
    )
  }
}

