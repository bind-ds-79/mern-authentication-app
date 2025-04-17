/*import userModel from "../models/userModels.js";

 export const getUserData=async(req,res)=>{

    try {

       const {userId}=req.body;
        const user=await userModel.findById(userId);

        if(!user){
            return res.json({success:false,message:"User not found"})
        } 

        res.json({
            success:true,
            userData:{
                name:user.name,
                isAccountVerified:user.isAccountVerified
            }

        })
        
    } catch (error) {
        return  res.json({success:false,message:error.message})
        
    }
 }  
*/

import userModel from "../models/userModels.js";

export const getUserData = async (req, res) => {
  try {
   const userId = req.userId;// ✅ From middleware
     // const {userId}=req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - user not logged in"
      });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      userData: {
        name: user.name,
        isAccountVerified: user.isAccountVerified
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
