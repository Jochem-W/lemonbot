import { Variables } from "./variables.mjs"
import { Octokit } from "@octokit/rest"
import { drizzle } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import postgres from "postgres"

export const GitHubClient = new Octokit({ auth: Variables.githubToken })

const client = postgres(Variables.databaseUrl)
export const Drizzle = drizzle(client)

await migrate(Drizzle, { migrationsFolder: "drizzle" })
