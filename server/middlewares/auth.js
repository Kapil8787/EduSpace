const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

//auth
exports.auth = async (req, res, next) => {
    try{
        // extract token from cookie/body/header
        const authorization = req.header("Authorization") || req.header("Authorisation") || "";
        const bearerToken = authorization.startsWith("Bearer ") ? authorization.replace("Bearer ", "") : "";
        const token = req.cookies?.token || req.body?.token || bearerToken;

        if(!token) {
            return res.status(401).json({
                success:false,
                message:'Token is missing',
            });
        }

        //verify the token
        try{
            const decode =  jwt.verify(token, process.env.JWT_SECRET);
            console.log("decode= ",decode);

            // Fetch current user status from DB to prevent stale tokens
            const existingUser = await User.findById(decode.id);
            if (!existingUser) {
                return res.status(401).json({
                    success:false,
                    message:'Invalid token - user does not exist',
                });
            }

            if (!existingUser.active) {
                return res.status(403).json({
                    success:false,
                    message:'Account is inactive',
                });
            }

            if (existingUser.accountType === "Instructor" && !existingUser.approved) {
                return res.status(403).json({
                    success:false,
                    message:'Account pending approval',
                });
            }

            req.user = { id: existingUser._id, accountType: existingUser.accountType };
        }
        catch(err) {
            //verification - issue
            return res.status(401).json({
                success:false,
                message:'token is invalid',
            });
        }
        next();
    }
    catch(error) {  
        return res.status(401).json({
            success:false,
            message:'Something went wrong while validating the token',
        });
    }
}

//isStudent
exports.isStudent = async (req, res, next) => {
 try{
        if(req.user.accountType !== "Student") {
            return res.status(401).json({
                success:false,
                message:'This is a protected route for Students only',
            });
        }
        next();
 }
 catch(error) {
    return res.status(500).json({
        success:false,
        message:'User role cannot be verified, please try again'
    })
 }
}


//isInstructor
exports.isInstructor = async (req, res, next) => {
    try{
           if(req.user.accountType !== "Instructor") {
               return res.status(401).json({
                   success:false,
                   message:'This is a protected route for Instructor only',
               });
           }
           next();
    }
    catch(error) {
       return res.status(500).json({
           success:false,
           message:'User role cannot be verified, please try again'
       })
    }
   }


//isAdmin
exports.isAdmin = async (req, res, next) => {
    try{
           if(req.user.accountType !== "Admin") {
               return res.status(401).json({
                   success:false,
                   message:'This is a protected route for Admin only',
               });
           }
           next();
    }
    catch(error) {
       return res.status(500).json({
           success:false,
           message:'User role cannot be verified, please try again'
       })
    }
   }