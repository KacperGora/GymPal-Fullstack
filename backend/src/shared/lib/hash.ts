import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const hashPassword = async (pass: string): Promise<string> => {
  return bcrypt.hash(pass, SALT_ROUNDS);
};

export const comparePassword = async (
  plainPass: string,
  hashPass: string,
): Promise<boolean> => {
  return bcrypt.compare(plainPass, hashPass);
};
