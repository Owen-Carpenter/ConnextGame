import BookingModel from '../models/authentication.js';

const handleLogout = {
    logout: async(req, res) => {

        const cookies = req.cookies;
        if (!cookies?.jwt) return res.sendStatus(204);
        const refreshToken = cookies.jwt;

        //Check refreshToken
        const foundUser = await BookingModel.findOne({ username })
        if(!foundUser){
            res.clearCookie('jwt', {httpOnly: true, sameSite: 'None', secure: true});
            return res.sendStatus(204);
        }

        foundUser.refreshToken = '';
        await foundUser.save();

        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
        res.sendStatus(204);
    }
};

export default handleLogout;