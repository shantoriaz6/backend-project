import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/coudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";

import jwt from "jsonwebtoken";
const registerUser = asyncHandler(async (req, res) => {
   //get user details from frontend
   //validation-not empty
   //check if user already exist-username,email
   //check for images,check for avatar
   //upload them to cloudinary - avatar
   //create user object - create entry in db
   //remove password and refresh token from response
   //check for user creation
   //return res


   const {fullName, email, userName, password}=req.body
   console.log("email",email);

   if ([fullName, email, userName, password].some((field) => field?.trim() ==="")
) {
    throw new ApiError(400, "All fields are Required")
   }

const existedUser = await User.findOne({
    $or: [{ userName},{ email}]
})
if(existedUser){
    throw new ApiError(409, "user with email or userName already exist")
}
const avatarLocalPath =req.files?.avatar[0]?.path;
//const coverImageLocalPath =req.files?.coverImage[0]?.path;
let coverImageLocalPath;
if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path;
}

if(!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required")
}
//console.log("avatar path",avatarLocalPath);
//console.log("FILES:", req.files)
//console.log("BODY:", req.body)

  const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar || !avatar.url) {
        throw new ApiError(400,[ "avatar upload failed"])
    }

     const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        userName: userName.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser, "user registered successfully")
    )
});

const generateAccessAndRefreshToken = async (userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()
        user.refreshToken = refreshToken
       await user.save ({validateBeforeSave: false})
        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong  while generating refresh and access")
    }
}
const loginUser = asyncHandler(async (req, res) => {
   // get data from req.body
    //username or password
    // find thr user
    //password check
    //access and refresh token
    //send cookies

    const {email, userName, password} = req.body;
    console.log("email",email);

    if(!userName && !email)
{
    throw new ApiError (400, "userName and email are required ")
}
const user = await User.findOne({
    $or: [{userName}, {email}]

})

if(!user) {throw new ApiError (404, "user does not exist")}

 const isPasswordValid= await user.isPasswordCorrect(password)
    if(!isPasswordValid) {throw new ApiError (401, "invalid credentials")}  

   const {accessToken, refreshToken}= await generateAccessAndRefreshToken(user._id)

   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
   const options = {
    httpOnly: true,
    secure: true
   }
   return res
   .status(200)
   .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
              user: loggedInUser,accessToken, refreshToken
            },
            "user logged in successfully"
        )
    )
   



})

const logoutUser = asyncHandler(async (req, res) => {
    User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken: 1 //this removes the field from document
            }
        },
        {
            new:true
        }
    )

     const options = {
    httpOnly: true,
    secure: true
   }
   return res
   .status(200)
   .clearCookie("accessToken", options)
   .clearCookie("refreshToken", options)
   .json(new ApiResponse(200, {}, "user Logged out"))


})

const refreshAccessToken = asyncHandler (async(req, res) => {
     const incomingRefreshToken= req.cookies.refreshToken ||req.body.refreshToken

     if(!incomingRefreshToken) { 
        throw new ApiError(401, "unauthorized request")
     }
   try {
     const decodedToken = jwt.verify (incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
     const user= await User.findById(decodedToken?._id)
 
      if(!user) { 
         throw new ApiError(401, "Invalid refresh token")
      }
      if(incomingRefreshToken !== user?.refreshToken) {
         throw new ApiError(401, "Refresh token is expired")
      }
      const options = {
         httpOnly: true,
         secure: true
      }
      const {accessToken, newRefreshToken} =await generateAccessAndRefreshToken(user._id)
      return res
      .status(200)
      .cookie("accessToken", accessToken, options)
         .cookie("refreshToken",newRefreshToken, options)
         .json (
             new ApiResponse(
                 200,
                 {
                     accessToken,
                     refreshToken: newRefreshToken
                 },
                 "Access token refreshed"
             )
         )
   } catch (error) {
    throw new ApiError(401, error?.message || "invalid refresh token")
   }

     

})

const changeCurentPassword = asyncHandler(async ( req, res) =>{
   const {oldPassWord, newPassWord } = req.body
 const user = await User.findById( req.user?._id)
 const isPasswordCorrect = await user.isPasswordCorrect(oldPassWord)
 if(!isPasswordCorrect){
    throw new ApiError(400, "inivalid old password")
 }
 user.password = newPassWord
 await user.save({validateBeforeSave: false})

 return res
 .status (200)
 .json(new ApiResponse(200, {}, "password change successfully"))

})

const getCurrentUser = asyncHandler(async(req,res) => {
    //return res
    //.status (200)
    //.json(200, req.user, "current user fetched successfully")

return res.status(200).json({
  statusCode: 200,
  data: req.user,
  message: "current user fetched successfully"
});



})

const updateAccountDetails = asyncHandler(async (req,res) => {
    const {fullName, email,  } = req.body

    if(!fullName || !email){
       throw new ApiError(400, "All fields are required") 
    }

  const user = await  User .findByIdAndUpdate(
    req.user?._id,
    {
        $set:{
            fullName,
            email
        }

    },
    {new: true}

).select ("-password")

return res.
status(200)
.json(new ApiResponse(200, user, "Accounts details updated successfully"))
   


})
const updateUserAvatar = asyncHandler(async (req,res) => {
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath) {
        throw new ApiError(400, "avatar file is missing")
    }
   const avatar = await uploadOnCloudinary(avatarLocalPath)

  // console.log("Cloudinary response:", avatar);


   if(!avatar?.url || !avatar?.public_id) {
     throw new ApiError(400, "Error while uploading on avatar")
   }

  const currentUser = await User.findById(req.user?._id)

  if(currentUser?.avatarPublicId) {
    Cloudinary.uploader.destroy(currentUser.avatarPublicId)
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
        $set: {
            avatar:avatar.url
        }

    },
    {new: true}
  ).select("-password")
  return res
  .status (200)
  .json(
    new ApiResponse(200, "avatar image updated successfully")
  )


})

const updateUserCoverImage = asyncHandler(async (req,res) => {
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath) {
        throw new ApiError(400, "coverImage file is missing")
    }
   const coverImage = await uploadOnCloudinary(coverImageLocalPath)

   if(!coverImage?.url || !coverImage?.public_id) {
     throw new ApiError(400, "Error while uploading on cover Image")
   }

    const currentUser = await User.findById(req.user?._id)

  if(currentUser?.coverImagePublicId) {
    Cloudinary.uploader.destroy(currentUser.coverImagePublicId)
  }

  await User.findByIdAndUpdate(
    req.user?._id,
    {
        $set: {
            avatar:coverImage.url
        }

    },
    {new: true}
  ).select("-password")
  return res
  .status (200)
  .json(
    new ApiResponse(200, "cover image updated successfully")
  )


})

const getUserChannelProfile = asyncHandler(async(req,res) =>{
    console.log("getUserChannelProfile triggered");

   const {userName} = req.params

   if(!userName?.trim()) {
    throw new ApiError(400, "userNamre is missing" )
   }

   //console.log("Requested userName:", userName);


const channel = await User.aggregate([
    {
        $match: {
            userName: userName?.toLowerCase()
        }

},
{
    $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers"

    }
},
{
    $lookup: {
       from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo"
    }
},
{
    $addFields: {
        subscribersCount: {
            $size: "$subscribers"
        },
        channelsSubscribedToCount: {
            $size: "$subscribedTo"

        },
        isSubscribed: {
         $cond: {
           if: { $in: [req.user?._id,"$subscribers.subscriber"]

           },
           then: true,
           else: false
           
         }
    }
}
},
{
    $project: {
        fullName: 1,
        userName: 1,
        subscribersCount: 1,
        isSubscribed: 1,
        channelsSubscribedToCount: 1,
        avatar: 1,
        coverImage: 1,
        email: 1

    }
}
])

//console.log("Aggregation result:", JSON.stringify(channel, null, 2));


if(!channel?.length) {
    throw new ApiError("CHANNEL DOES NOT EXIST")
}
console.log("Channel profile:", JSON.stringify(channel, null, 2));
return res 
.status (200)
.json(
    new ApiResponse(200, channel[0], "user channel fetched successfully")
)

})
const getWatchHistory = asyncHandler(async (req,res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {$lookup: {
            from: "Videos",
            localField: "watchHistory",
            foreignField: "_id",
            as: "watchHistory"  ,
            pipeline: [
               
            {
                $lookup: {
                    from : "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner",
                    pipeline: [
                        {
                            $project: {
                                fullName: 1,
                                userName: 1,
                                avatar: 1
                            }
                        },
                        {
                            $addFields: {
                               owner: { $arrayElemAt: ["$owner", 0] }
                            }
                        }
                    ]

                }
            }]
        }}
    ])
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "watch history fetched successfully"

        )
    )


});

export { 
    registerUser ,
     loginUser,
     logoutUser,
     refreshAccessToken,
     changeCurentPassword,
     getCurrentUser,
     updateAccountDetails,
     updateUserAvatar,
     updateUserCoverImage,
     getUserChannelProfile,
     getWatchHistory,


    }
