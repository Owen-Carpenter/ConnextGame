import BookingModel from "../models/authentication.js";
import bcrypt from 'bcrypt';

const handleNewUser = {
    register: async (req, res) => {
        try {
            const { username, password, email } = req.body;

            // User/Pwd Not Found
            if (!username || !password) return res.status(400).json({ 'message': 'Username and password are required' });

            const duplicateUser = await BookingModel.findOne({ email });
            if (duplicateUser) return res.status(409).json({ 'message': 'User already exists' });

            try {
                const hashedPwd = await bcrypt.hash(password, 10);

                const result = await BookingModel.create({
                    "username": username,
                    "password": hashedPwd,
                    "email": email,
                    "notifications": [],
                    "appointments": [],
                    "services": []
                });

                console.log(result);

                res.status(201).json({ 'success': `New user ${username} created!` });
            } catch (err) {
                res.status(500).json({ 'message': err.message });
            }
        } catch (err) {
            res.status(500).json({ 'message': err.message });
        }
    }
};

export default handleNewUser;