import mongoose from "mongoose";
const TagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: [3, 'نام برچسب باید حداقل ۳ کاراکتر باشد'],
    maxlength: [100, 'نام برچسب نمی‌تواند بیش از ۱۰۰ کاراکتر باشد']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.models.Tag ||
  mongoose.model("Tag", TagSchema);
 
