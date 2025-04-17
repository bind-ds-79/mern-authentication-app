/*import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();


const userAuth= async (req,res,next)=>{
   const {token}=req.cookies;

    if(!token){ 
        return res. json({success:false,message:"Not Autherized Login Again "})
    }
    
    try {
        const tokenDecode = jwt.verify(token,process.env.JWT_SECRET);

     if(tokenDecode.id){
           req.body.userId= tokenDecode.id;  //req.body.userId replace by
          //req.body.userId= tokenDecode.id;  
           
    }else{
       return  res.json({success:false,message:"Not Autherized Login Again"});
    
    }

    next();
        
    } catch (error) {
        res.json({success:false,message:error.message});
        
    }
}  

export default userAuth; 

*/

import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ success: false, message: "Not Authorized. Login again." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id) {
      return res.json({ success: false, message: "Invalid token. Login again." });
    }

    // ✅ Safely attach userId
    req.userId = decoded.id;
    //req.body.userId=decoded.id

    next();
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export default userAuth;
