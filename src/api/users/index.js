// ******************************************* USERS RELATED ENDPOINTS ***********************************

/* ********************************************** USERS CRUD ENDPOINTS ***********************************

1. CREATE --> POST http://localhost:3001/users/ (+body)
2. READ --> GET http://localhost:3001/users/ (+ optional query params)
3. READ (single user) --> GET http://localhost:3001/users/:userId
4. UPDATE (single user) --> PUT http://localhost:3001/users/:userId (+ body)
5. DELETE (single user) --> DELETE http://localhost:3001/users/:userId

*/

import express from "express"; // 3RD PARTY MODULE (npm i express)
import fs from "fs"; // CORE MODULE (no need to install it!!!)
import { fileURLToPath } from "url"; // CORE MODULE
import { dirname, join } from "path"; // CORE MODULE
import uniqid from "uniqid"; // 3RD PARTY MODULE (npm i uniqid)
import { getUsers } from "../../lib/fs-tools.js";

const usersRouter = express.Router(); // an Express Router is a set of similar endpoints grouped in the same collection

// ****************************** HOW TO GET USERS.JSON PATH *****************************************

// target --> D:\Epicode\2022\BE-MASTER-03\U4\epicode-u4-d2-3\src\api\users\users.json

// 1. We gonna start from the current's file path --> D:\Epicode\2022\BE-MASTER-03\U4\epicode-u4-d2-3\src\api\users\index.js
console.log("CURRENTS FILE URL: ", import.meta.url);
console.log("CURRENTS FILE PATH: ", fileURLToPath(import.meta.url));
// 2. We can obtain the parent's folder path --> D:\Epicode\2022\BE-MASTER-03\U4\epicode-u4-d2-3\src\api\users\
console.log("PARENT FOLDER PATH: ", dirname(fileURLToPath(import.meta.url)));
// 3. We can concatenate parent's folder path with "users.json" --> D:\Epicode\2022\BE-MASTER-03\U4\epicode-u4-d2-3\src\api\users\users.json
console.log(
  "TARGET: ",
  join(dirname(fileURLToPath(import.meta.url)), "users.json")
);

const usersJSONPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "users.json"
);

// ***************************************************************************************************

// 1. POST http://localhost:3001/users/ (+body)
usersRouter.post("/", (req, res) => {
  // 1. Read the request body
  console.log("REQ BODY:", req.body); // remember to add express.json() into server.js configuration!!!

  // 2. Add some server generated informations (unique id, createdAt, ..)
  const newUser = {
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date(),
    id: uniqid(),
  };

  // 3. Save the new user into users.json file
  // 3.1 Read the content of the file, obtaining an array
  const usersArray = JSON.parse(fs.readFileSync(usersJSONPath));

  // 3.2 Push new user into the array
  usersArray.push(newUser);

  // 3.3 Write the array back to file
  fs.writeFileSync(usersJSONPath, JSON.stringify(usersArray)); // We cannot pass an array here as second argument, we shall convert it into a string

  // 4. Send back a proper response
  res.status(201).send({ id: newUser.id });
});

// 2. GET http://localhost:3001/users/
usersRouter.get("/", (req, res) => {
  // 1. Read the content of users.json file, obtaining an array
  const fileContentAsABuffer = fs.readFileSync(usersJSONPath); // Here you obtain a BUFFER object, which is a MACHINE READABLE FORMAT

  const usersArray = JSON.parse(fileContentAsABuffer);
  // 2. Send it back as a response
  res.send(usersArray);
});

// 3. GET http://localhost:3001/users/:userId
usersRouter.get("/:userId", async (req, res) => {
  // 1. Obtain the userId from the URL
  const userId = req.params.userId;

  // 2. Read the file --> obtaining an array
  const usersArray = await getUsers();

  // 3. Find the specified user in the array
  const user = usersArray.find((user) => user.id === userId);

  // 4. Send it back as a response
  res.send(user);
});

// 4. PUT http://localhost:3001/users/:userId
usersRouter.put("/:userId", (req, res) => {
  // 1. Read the file obtaining an array
  const usersArray = JSON.parse(fs.readFileSync(usersJSONPath));

  // 2. Modify the specified user by merging previous properties with the properties coming from req.body
  const index = usersArray.findIndex((user) => user.id === req.params.userId);
  const oldUser = usersArray[index];
  const updatedUser = { ...oldUser, ...req.body, updatedAt: new Date() };
  usersArray[index] = updatedUser;

  // 3. Save the modified array back to disk
  fs.writeFileSync(usersJSONPath, JSON.stringify(usersArray));

  // 4. Send back a proper response
  res.send(updatedUser);
});

// 5. DELETE http://localhost:3001/users/:userId
usersRouter.delete("/:userId", (req, res) => {
  // 1. Read the file obtaining an array
  const usersArray = JSON.parse(fs.readFileSync(usersJSONPath));

  // 2. Filter out the specified user from the array, keeping just the array of remaining users
  const remainingUsers = usersArray.filter(
    (user) => user.id !== req.params.userId
  );

  // 3. Save the array of remaining users back to disk
  fs.writeFileSync(usersJSONPath, JSON.stringify(remainingUsers));

  // 4. Send back a proper response
  res.send();
});

export default usersRouter; // Please do not forget to export!
