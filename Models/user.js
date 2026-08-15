const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

const plmPlugin = passportLocalMongoose && passportLocalMongoose.default ? passportLocalMongoose.default : passportLocalMongoose;
if (typeof plmPlugin !== 'function') {
    throw new Error('passport-local-mongoose plugin not found or invalid');
}
UserSchema.plugin(plmPlugin);

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);