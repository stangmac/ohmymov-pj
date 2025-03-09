// const mongoose = require('mongoose')
// const Schema =mongoose.Schema
// const bcrypt = require('bcrypt')


// //create keep database
// const UserSchema = new Schema({
//     username: {
//         type: String,
//         required: [true, 'Please enter a valid username']
//     },
//     date: {
//         type: Date,
//         required: [true, 'Please enter a valid Birth date']
//     },
//     gender: {
//         type: String,
//         required: [true, 'Please enter a valid Your gender']
//     },
//     password: {
//         type: String,
//         required: [true, 'Please enter a valid password']
//     }
// })

// //hash password
// UserSchema.pre('save', function(next) {
//     const user = this;

//     // Hash the password only
//     bcrypt.hash(user.password, 10).then(hash => {
//         user.password = hash;
//         next();
//     }).catch(error => {
//         console.error(error);
//     });
// });



//     const User = mongoose.model('User', UserSchema)
//     module.exports = User

// const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');

// const UserSchema = new mongoose.Schema({ 
//     username: {
//         type: String,
//         required: [true, 'Please enter a valid username']
//     },
//     date: {
//         type: Date,
//         required: [true, 'Please enter a valid Birth date']
//     },
//     gender: {
//         type: String,
//         required: [true, 'Please enter a valid gender']
//     },
//     password: {
//         type: String,
//         required: [true, 'Please enter a valid password']
//     }
// });

// // Hash password before saving
// UserSchema.pre('save', async function(next) {
//     if (!this.isModified('password')) return next();
//     try {
//         this.password = await bcrypt.hash(this.password, 10);
//         next();
//     } catch (error) {
//         next(error);
//     }
// });

// const User = mongoose.model('User', UserSchema);
// module.exports = User;

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({ 
    username: {
        type: String,
        required: [true, 'Please enter a valid username']
    },
    date: {
        type: Date,
        required: [true, 'Please enter a valid Birth date']
    },
    gender: {
        type: String,
        required: [true, 'Please enter a valid gender']
    },
    password: {
        type: String,
        required: [true, 'Please enter a valid password']
    },
    lastLogin: {  
        type: Date,
        default: null
    }
});

// ❌ ลบ pre('save') ที่เข้ารหัสรหัสผ่านซ้ำซ้อน

const User = mongoose.model('User', UserSchema);
module.exports = User;
