import express from "express";
import userAuth from "../server/middleware/userAurh.js";
import { getUserData } from "../controllers/usercontroller.js";
 const userRouter=express.Router();

 userRouter.get("/data",userAuth,getUserData)

 export default userRouter;