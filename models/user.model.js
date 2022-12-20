const mongoose = require("mongoose");
const {GENDER_SECRET} = require("../constants/constants");
const {GENDER_FEMALE} = require("../constants/constants");
const {GENDER_MALE} = require("../constants/constants");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
        default: 'UserName'
    },
    password: {
        type: String,
        max: 255,
        min: 6,
        required: true
    },
    phoneNumber: {
        type: String,
        unique: true,
        required: true
    },
    avatar: {
        url: String,
        publicId: String,
        require: false
    },
    coverImage: {
        url: String,
        publicId: String,
        require: false
    },
    gender: {
        type: String,
        enum: [GENDER_MALE, GENDER_FEMALE, GENDER_SECRET],
        required: false,
        default: GENDER_SECRET,
    },
    online: {
        type: Boolean,
        require: false
    },
    token: {
        type: String,
        require: false
    },
    isBlocked: {
        type: Boolean,
        require: false,
        default: false
    },
    uuid: {
        type: String,
        require: false
    },
    active: {
        type: Boolean,
        require: false
    },
    description: {
        type: String,
        required: false
    },
    link: {
        type: String,
        required: false
    },
    city: {
        type: String,
        required: false
    },
    country: {
        type: String,
        required: false
    },
    coordinates: {
        latitude: String,
        longitude: String,
        require: false
    }

});

userSchema.index({phoneNumber: 'text'});
userSchema.set('timestamps', true);

const User = mongoose.model('User', userSchema);
User.prototype.getDefaultAvatar = () => {
    return 'https://res.cloudinary.com/it4895/image/upload/v1607791757/it4895/avatars/default-avatar_jklwc7.jpg';
}
User.prototype.getAvatar = () => {
    if(!this.avatar) return 'https://res.cloudinary.com/it4895/image/upload/v1607791757/it4895/avatars/default-avatar_jklwc7.jpg';
    return this.avatar.url;
}
module.exports = User;
