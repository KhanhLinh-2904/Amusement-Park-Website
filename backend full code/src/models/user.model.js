const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  loginName: {
    type: String,
    minLength: 6,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minLength: 8,
  },
  role: {
    type: String,
    enum: ["staff", "admin", "customer"],
    default: "staff",
  },
  profile: {
    name: {
      type: String,
      trim: true,
      default: "",
    },
    gender: {
      type: String,
      enum: ["male", "female", "undefined"],
      default: "undefined",
    },
    age: {
      type: Number,
      default: 0,
    },
    image: {
      url: { type: String, default: null },
      cloudinary_id: {
        type: String,
        default: null,
      },
    },
  },
});

userSchema.statics.isEmailTaken = async (loginName, excludeUserId) => {
  const user = await this.findOne({ loginName, _id: { $ne: excludeUserId } });
  return !!user;
};

const User = mongoose.model("user", userSchema);
module.exports = User;
