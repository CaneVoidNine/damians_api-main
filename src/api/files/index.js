import express from "express"
import multer from "multer"
import { extname } from "path"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { saveUsersAvatars, getUsers, writeUsers } from "../../lib/fs-tools.js"

const filesRouter = express.Router()

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary, // cloudinary is going to search in .env vars for smt called process.env.CLOUDINARY_URL
    params: {
      folder: "fs0422/users",
    },
  }),
}).single("avatar")

filesRouter.post("/:userId/single", cloudinaryUploader, async (req, res, next) => {
  // "avatar" needs to match exactly to the name of the field appended in the FormData object coming from the FE
  // If they do not match, multer will not find the file
  try {
    /* const originalFileExtension = extname(req.file.originalname)
    const fileName = req.params.userId + originalFileExtension

    await saveUsersAvatars(fileName, req.file.buffer)

    const url = `http://localhost:3001/img/users/${fileName}`
 */

    console.log(req.file)
    const url = req.file.path
    const users = await getUsers()

    const index = users.findIndex(user => user.id === req.params.userId) // 1. Find user (by userID)
    if (index !== -1) {
      const oldUser = users[index]
      // 2. Add to user a field called avatar (or in the case of book it could be author.avatar) containing the url of the file

      const author = { ...oldUser.author, avatar: url }
      const updatedUser = { ...oldUser, author, updatedAt: new Date() }

      users[index] = updatedUser

      await writeUsers(users)
    }

    // In FE <img src="http://localhost:3001/img/users/magic.gif" />

    res.send("File uploaded")
  } catch (error) {
    next(error)
  }
})

filesRouter.post("/multiple", multer().array("avatars"), async (req, res, next) => {
  try {
    console.log("FILES:", req.files)
    await Promise.all(req.files.map(file => saveUsersAvatars(file.originalname, file.buffer)))
    res.send("File uploaded")
  } catch (error) {
    next(error)
  }
})

export default filesRouter
