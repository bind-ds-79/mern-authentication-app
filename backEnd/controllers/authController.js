
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken';
import transporter from "../config/nodemailer.js";
import userModel from "../models/userModels.js";
import { json } from "express";
import {EMAIL_VERIFY_TEMPLATE,PASSWORD_RESET_TEMPLATE} from "../config/email_Template.js"

// register 
export const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.json({ success: false, message: "Missing details " });
    }
    try {
        const existingUser = await userModel.findOne({ email })

        if (existingUser) {
            return res.json({ success: false, message: "User already Exist!" })
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new userModel({ name, email, password: hashedPassword })
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.cookie("token", token,

            {
                httpOnly: true, secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
                maxAge: 7 * 24 * 60 * 60 * 100
            })

        // Step 2: Set up mail options
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: process.env.RECIEVER_EMAIL,
            subject: 'Welcome to our website! 🎉✨',
            text: `Your account has been created with email id :${email}`,
         /*    html: `
                <h3>Hello!</h3>
                <p>Click the link below to verify your email:</p>
                <a href="http://localhost:5173/email-verify">Verify Email</a>
              ` */
        };
        // Step 3: Send the email
         transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log('Error while sending email:', error);
            }
            console.log('Email sent:', info.response);
        });


        // await transporter.sendMail(mailOptions);
        return res.json({ success: true })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}
// login

export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.json({ success: false, message: "Email and password  are required" });
    }

    try {

        const user = await userModel.findOne({ email });
        if (!user) {
             return res.json({ success: false, message: " Invalid email" })

        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.json({ success: false, message: " Invalid password" })

        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.cookie("token", token,

            {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
                maxAge: 7 * 24 * 60 * 60 * 100
            })

        return res.json({ success: true })

    } catch (error) {
        res.json({ success: false, message: error.message })

    }
}
// logout

export const logout = async (req, res) => {
    try {

        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ?
                "none" : "strict",
        })

        return res.json({ success: true, message: "Logged out" })

    } catch (error) {
        res.json({ success: false, message: error.message })

    }
}

//send otp for account verification
export const sendverifyOpt = async (req, res) => {
    try {
        // const {userId }= req.body;
       const userId= req.userId;


      const user = await userModel.findById(userId);
  
      if (!user) {
        return res.json({ success: false, message: "User not found" });
      }
  
      if (user.isAccountVerified) {
        return res.json({ success: false, message: "Account already verified" });
      }
  
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.verifyotp = otp;
      user.verifyotpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
  
      await user.save();
  
      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to:user.email,
       // to:process.env.RECIEVER_EMAIL, // ✅ Make sure `email` exists in your user model
        subject: 'Account verification OTP',
       // text: `Your OTP is ${otp}. Verify your account using this OTP.`,
        html:EMAIL_VERIFY_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",process.env.RECIEVER_EMAIL)

      };
  
      await transporter.sendMail(mailOptions);
      return res.json({ success: true, message: "Verification OTP sent on Email" });
  
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
  };
  
 // user verify email
export const verifyEmail = async (req, res) => {
    const {otp } = req.body; //instide off const {userId,otp}=req.body
    const userId=req.userId;

    if (!userId || !otp) {
        res.json({ success: false, message: "Missing Details " });
    }

    try {
        const user = await userModel.findById(userId);

        if (!user) {
            res.json({ success: false, message: "User not found" });

        }

        if (user.verifyotp === "" || user.verifyotp !== otp) {
            res.json({ success: false, message: "Invalid OTP" });

        }

        if (user.verifyotpExpireAt < Date.now()) {
            res.json({ success: false, message: "OTP Expired" });

        }

        user.isAccountVerified = true;

        user.varifyotp = "";
        user.verifyotpExpireAt= 0;

        await user.save();

       return res.json({ success: true, message: "Email verified sucessfully" });


    } catch (error) {

      res.json({ success: false, message: error.message });

    }


}

export const isAuthenticated=async(req,res)=>{
    try {

        return res.json({success:true})
        
    } catch (error) {
        return  res.json({success:false,message:error.message})
    }
}

//send otp for reset password

export const sendResetOtp=async (req,res)=>{
    const {email}=req.body;

    try {

        if(!email){
            return res.json({success:false,message:"Email are required !"});
        }
         const user=await userModel.findOne({email});

         if(!user){
            return res.json({success:false,message:"User not found"})
         }

         const otp = Math.floor(100000 + Math.random() * 900000).toString();
         user.resetOtp= otp;
         user.resetOtpExpireAt= Date.now() + 15 * 60 * 1000;
     
         await user.save();
     
         const mailOptions = {
           from: process.env.SENDER_EMAIL,
           to:process.env.RECIEVER_EMAIL, // ✅ Make sure `email` exists in your user model
           subject: 'Password Reset OTP',
          /* text: `Your OTP for resetting your password is ${otp}.
           USe this OTP to proceed with resetting your password.`,*/
        html:PASSWORD_RESET_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",process.env.RECIEVER_EMAIL)

           
         };
     
         await transporter.sendMail(mailOptions);

         return res.json({ success: true, message:" OTP sent on your Email" });
        
    } catch (error) {
       return res.json({success:false,message:error.message})
    }


}

// reset User Password

export const resetPassword=async(req,res)=>{
    const {email,otp,newPassword}=req.body;

    if(!email ||!otp || !newPassword){
       return res.json({success:false,message:"Email or otp and Password are required"})
       }
       
    try {
        const user=await userModel.findOne({email});

        if(!user){
            return res.json({success:false,message:"uses is not found "})
        }

        if(user.resetOtp===""|| user.resetOtp !==otp){
            return res.json({success:false,message:"Invalied OTP"});
        }

        if(user.resetOtpExpireAt <Date.now()){
            return res,json({success:false,message:"OTP Expired"})
        }

        const hashedPassword=await bcrypt.hash(newPassword,10);


         user.password=hashedPassword;
         user.resetOtp="";
         user.resetPassword=0;
         await user.save();

         return res.json({success:true,message:"Password has been reset successfully"})  
        
    } catch (error) {
        return  res.json({success:false,message:error.message})
        
    }
}