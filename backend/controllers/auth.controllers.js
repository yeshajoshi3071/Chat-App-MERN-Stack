import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../utils/generateToken.js";

export const signup = async(req, res) => {
   try {
       const {fullName, username, password, confirmPassword, gender} = req.body;

       if(password !== confirmPassword) {
           return res.status(400).json({message: "Passwords do not match"})
       }

       const user = await User.findOne({username});
       if(user) {
           return res.status(400).json({message: "User already exists"})
       }

       //Hash password here
       const salt  =  await bcrypt.genSalt(10);
       const hashedPassword = await bcrypt.hash(password, salt);

       // https://avatar-placeholder.iran.liara.run/

       const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
       const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;

       const newUser = new User({
           fullName,
           username,
           password: hashedPassword,
           gender,
           profilePicture: gender === "male" ? boyProfilePic : girlProfilePic
       });

    if(newUser) {
        //generate JWT token here
        generateTokenAndSetCookie(newUser._id, res);
        await newUser.save();

        res.status(200).json({
         _id: newUser._id,
         fullName: newUser.fullName,
         username: newUser.username,
         profilePicture: newUser.profilePicture
        });
    } else {
        res.status(400).json({message: "Invalid User data"})
    }

   } catch (error) {
       console.log("Error in signup controller", error.message);
       res.status(500).json({message: "Internal server error"})
   }
}

export const logout = async(req, res) => {
    console.log("logoutUser");
}

export const login = async(req, res) => {
   try {
    const {username, password} = req.body;
    const user = await User.findOne({username});
    const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

    if(!user || !isPasswordCorrect) {
        return res.status(400).json({message: "Invalid username or password"})
    }

    generateTokenAndSetCookie(user._id, res);
    res.status(200).json({
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        profilePicture: user.profilePicture
    });

   } catch {
         console.log("Error in login controller", error.message);
         res.status(500).json({message: "Internal server error"})
   }

}