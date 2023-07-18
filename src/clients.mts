import { Variables } from "./variables.mjs"
import { S3Client } from "@aws-sdk/client-s3"
import { Octokit } from "@octokit/rest"
import { drizzle } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import postgres from "postgres"

export const GitHubClient = new Octokit({ auth: Variables.githubToken })

export const Db = postgres(Variables.databaseUrl)
export const Drizzle = drizzle(Db)
export const S3 = new S3Client({
  region: Variables.s3Region,
  endpoint: Variables.s3Endpoint,
  credentials: {
    accessKeyId: Variables.s3AccessKeyId,
    secretAccessKey: Variables.s3SecretAccessKey,
  },
})

await migrate(Drizzle, { migrationsFolder: "drizzle" })
