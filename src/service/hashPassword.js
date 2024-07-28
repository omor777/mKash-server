import bcrypt from "bcryptjs";
const checkHashPassword = ({ hashPass, pass }) => {
  return bcrypt.compare(pass, hashPass);
};

export { checkHashPassword };
