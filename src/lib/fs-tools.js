import { fileURLToPath } from "url"
import { dirname, join } from "path"
import fs from "fs-extra"

const { readJSON, writeJSON, writeFile } = fs

const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../data")
const publicFolderPath = join(process.cwd(), "./public/img/users")

console.log("ROOT OF THE PROJECT:", process.cwd())
console.log("PUBLIC FOLDER:", publicFolderPath)

console.log("DATA FOLDER PATH: ", dataFolderPath)
const usersJSONPath = join(dataFolderPath, "users.json")
const booksJSONPath = join(dataFolderPath, "books.json")

export const getUsers = () => readJSON(usersJSONPath)
export const writeUsers = usersArray => writeJSON(usersJSONPath, usersArray)
export const getBooks = () => readJSON(booksJSONPath)
export const writeBooks = booksArray => writeJSON(booksJSONPath, booksArray)

export const saveUsersAvatars = (fileName, contentAsABuffer) =>
  writeFile(join(publicFolderPath, fileName), contentAsABuffer)
