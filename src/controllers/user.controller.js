import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/coudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";

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

export { registerUser };
