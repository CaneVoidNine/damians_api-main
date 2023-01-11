// const express = require("express") // OLD IMPORT SYNTAX
import express from "express"; // NEW IMPORT SYNTAX (do not forget to add type: "module" to package.json to use this!!)
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import { join } from "path";
import createHttpError from "http-errors";
import usersRouter from "./api/users/index.js";
import booksRouter from "./api/books/index.js";
import filesRouter from "./api/files/index.js";
import {
  genericErrorHandler,
  notFoundHandler,
  badRequestHandler,
  unauthorizedHandler,
} from "./errorHandlers.js";

const server = express();

const port = process.env.PORT;

const publicFolderPath = join(process.cwd(), "./public");

// ************************************** CORS *******************

/* CROSS-ORIGIN RESOURCE SHARING

Cross-Origin Requests:

1. FE=http://localhost:3000 and BE=http://localhost:3001 <-- 2 different port numbers they are 2 different origins
2. FE=https://myfe.com and BE=https://mybe.com <-- 2 different domains they are 2 different origins
3. FE=https://domain.com and BE=http://domain.com <-- 2 different protocols they are 2 different origins

*/

// ***************************************************************

// ***************** MIDDLEWARES ********************

// Add headers before the routes are defined

const loggerMiddleware = (req, res, next) => {
  // console.log(req.headers)
  console.log(
    `Request method ${req.method} -- url ${req.url} -- ${new Date()}`
  );
  req.user = "Dan";
  next(); // gives the control to whom is coming next (either another middleware or route handler)
};

/* const policeOfficerMiddleware = (req, res, next) => {
  console.log("Current user:", req.user)
  if (req.user === "Riccardo") {
    res.status(403).send({ message: "Riccardos are not allowed!" }) // Middlewares could decide to end the flow
  } else {
    next()
  }
} */
const whitelist = [process.env.FE_DEV_URL, process.env.FE_PROD_URL];

const corsOpts = {
  origin: (origin, corsNext) => {
    console.log("CURRENT ORIGIN: ", origin);
    if (!origin || whitelist.indexOf(origin) !== -1) {
      // If current origin is in the whitelist you can move on
      corsNext(null, true);
    } else {
      // If it is not --> error
      corsNext(
        createHttpError(400, `Origin ${origin} is not in the whitelist!`)
      );
    }
  },
};

server.use(express.static(publicFolderPath));
server.use(cors(corsOpts));

server.use(loggerMiddleware);
/* server.use(policeOfficerMiddleware) */
server.use(express.json()); // If you do not add this line here BEFORE the endpoints, all req.body will be UNDEFINED

// ****************** ENDPOINTS *********************
server.use("/users", loggerMiddleware, usersRouter); // All users related endpoints will share the same /users prefix in their urls
server.use("/books", loggerMiddleware, booksRouter);
server.use("/files", loggerMiddleware, filesRouter);

// ****************** ERROR HANDLERS ****************
server.use(badRequestHandler); // 400
server.use(unauthorizedHandler); // 401
server.use(notFoundHandler); // 404
server.use(genericErrorHandler); // 500
// (the order of these error handlers does not really matters, expect for genericErrorHandler which needs to be the last in chain)

server.listen(port, () => {
  console.table(listEndpoints(server));
  console.log("Server is running on port:", port);
});
