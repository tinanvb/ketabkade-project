import mongoose from "mongoose";
const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: [3, 'نام دسته‌بندی باید حداقل ۳ کاراکتر باشد'],
    maxlength: [30, 'نام دسته‌بندی نمی‌تواند بیش از ۳۰ کاراکتر باشد']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.models.Category ||
  mongoose.model("Category", CategorySchema);
 
