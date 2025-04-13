// models/User.ts
import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

// Define the schema for the user
const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

// Method to encrypt password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
UserSchema.methods.matchPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.models.User || mongoose.model("User", UserSchema);
