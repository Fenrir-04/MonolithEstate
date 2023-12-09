import bcryptjs from 'bcryptjs';
import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';

export const test = (req,res) => {
    res.json(
        {
            message: "Hello world!",
        }
    );
}

export const updateUser = async (req,res,next) => {
    // req.user.id -> the user's id we recieve after the verification(from verifyToken) is done and it's successfull
    // req.params.id -> the id entered into the parameters int user.router.update:id
    // both must be same for the updation process
    if(req.user.id !== req.params.id) return next(errorHandler(401, 'you can only update you own account!'));

    try{
        if(req.body.password){
            req.body.password = bcryptjs.hashSync(req.body.password, 10); // encrypt the password
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id, { // update the data
                $set: { // set is used bcoz, user might not chenge everything, he can just cahnge any one field
                    username: req.body.username,
                    email: req.body.email,
                    password: req.body.password,
                    avatar: req.body.avatar,
                },
            }, 
            {new: true} // without it, the new updated data won't be applied, and the previous data would be shown
        ); 
        
        const {password, ...rest} = updatedUser._doc;
        res.status(200).json(rest);
    }

    catch(err){
        next(err); // handle error thru middleware -> error.js in utils
    }
}

export const deleteUser = async (req,res,next) => {
    // req.user.id -> the user's id we recieve after the verification(from verifyToken) is done and it's successfull
    // req.params.id -> the id entered into the parameters int user.router.update:id
    // both must be same for the updation process
    if(req.user.id !== req.params.id) return next(errorHandler(401, 'you can only delete you own account!'));

    try{
        await User.findByIdAndDelete(req.params.id); // simply delete the account present at the given id
        res.clearCookie('access_token');
        res.status(200).json('User has been deleted successfully!');
    }
    catch(err){
        next(err); // handle error thru middleware -> error.js in utils
    }
}
