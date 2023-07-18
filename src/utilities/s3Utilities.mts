import { S3 } from "../clients.mjs"
import { DownloadError } from "../errors.mjs"
import { Config } from "../models/config.mjs"
import { type PutObjectCommandInput } from "@aws-sdk/client-s3"
import { Upload, type Options } from "@aws-sdk/lib-storage"
import type { Attachment } from "discord.js"

export async function uploadAttachment(
  bucket: Required<PutObjectCommandInput["Bucket"]>,
  key: Required<PutObjectCommandInput["Key"]>,
  attachment: Attachment
) {
  const options: Options = {
    client: S3,
    params: {
      Bucket: bucket,
      Key: key,
    },
  }

  const response = await fetch(attachment.url)
  if (!response.ok) {
    throw new DownloadError(response.url)
  }

  if (response.body) {
    options.params.Body = response.body
  }

  if (attachment.contentType) {
    options.params.ContentType = attachment.contentType
  }

  await new Upload(options).done()
  return new URL(key ?? "", Config.s3.url)
}
