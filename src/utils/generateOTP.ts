import otpGenerator from "otp-generator";

const generateOTP = (): string => {
  const otp = otpGenerator.generate(4, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  return otp;
};

export default generateOTP;
