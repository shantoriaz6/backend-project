import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";





export const verifyjwt = asyncHandler (async (req, _, next) => {

try {
    const token = req.cookies?.accessToken || req.headers ('Authorization')?.replace ('Bearer ', '')
    console.log("token",token);
    if(!token) {
        throw new ApiError (401, "unauthorized request")
    }
    const decodedToken = jwt.verify( token, process.env.ACCESS_TOKEN_SECRET)
    
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
    if(!user) {
        //todo: discuss about frontend
        throw new ApiError (401, "invalid token request")
    }
    
    req.user = user;
    next()
} catch (error) {
    throw new ApiError (401, "invalid access token")
}
})