import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    login: String,
    email: String,
    name: String,
	lastName: String,
	password: String,
    age: Number,
    createdAt: String,
    updatedAt: String
}, {versionKey: false});

module.exports = mongoose.model('User', userSchema);