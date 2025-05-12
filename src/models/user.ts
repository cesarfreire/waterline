import mongoose, { models, mongo, Schema } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
  },
  {
    collection: "users",
    timestamps: true,
  }
);

const User = models.User || mongoose.model("User", userSchema);
export default User;
