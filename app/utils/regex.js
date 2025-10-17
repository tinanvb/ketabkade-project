export const phoneNumberRegex = /^(\+98|0)?9\d{9}$/;
export const emailRegex = /^[\w.-]+@[a-zA-Z\d-]+\.[a-zA-Z]{2,}$/;
export const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
export const nameRegex = /^[آ-یءٔ\s]{2,30}$/;
export const passwordRegex =/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&_-])[A-Za-z\d@$!%*?&_-]{8,}$/
export const otpRegex=/^\d{6}$/;
export const internalRegex = /^\/[^\s]*$/;
export const externalRegex = /^https?:\/\/[^\s]+$/;
export const titleRegex = /^[\u0600-\u06FFa-zA-Z\s]{3,30}$/; // فارسی و انگلیسی
export const categoriesNameRegex = /^[\u0600-\u06FFa-zA-Z0-9\s/-]{3,30}$/;
export const discountCodeRegex = /^[A-Z0-9]+$/;
export const productNameRegex = /^[\u0600-\u06FFa-zA-Z0-9\s\-_/()]{3,50}$/;
export const productDescriptionRegex = /^.{3,}$/;
export const tagNameRegex = /^[\u0600-\u06FFa-zA-Z0-9\s/-]{3,30}$/;
