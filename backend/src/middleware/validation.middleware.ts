import { Request, Response, NextFunction } from "express";

// ====================================================================================================== //
//                                              HELPER
// ====================================================================================================== //
// VALIDAZIONE EMAIL
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// VALIDAZIONE PASSWORD
export const isValidPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/; // MIN 8 CARATTERI - ALMENO 1 NUMERO - ALMENO 1 LETTEERA MINUSCOLA - ALMENO 1 LETTERA MAIUSCOLA
  return passwordRegex.test(password);
};
// ====================================================================================================== //
// ====================================================================================================== //
// ====================================================================================================== //
//                                    MIDDLEWARE: VALIDARE LA REGISTRAZIONE
// ====================================================================================================== //

export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email, password, firstName, lastName, age, acceptedTerms } = req.body;
  const errors: string[] = [];

  // CHECK DEI CAMPI
  if (!email) errors.push("Email is required");
  if (!password) errors.push("Password is required");
  if (!firstName) errors.push("First Name is required");
  if (!lastName) errors.push("Last Name is required");
  if (age === undefined || age === null) errors.push("Age not valid");
  if (acceptedTerms === undefined || acceptedTerms === null) {
    errors.push("You must accept the terms and privacy policy");
  }

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  if (!isValidEmail(email)) {
    errors.push("Invalid format email");
  }

  if (!isValidPassword(password)) {
    errors.push(
      "Password must be at least 8 characters with uppercase, lowercase and number"
    );
  }

  if (firstName.trim().length < 2) {
    errors.push("First name must be at least 2 characters");
  }

  if (lastName.trim().length < 2) {
    errors.push("Last name must be at least 2 characters");
  }

  const ageNum = Number(age);
  if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
    errors.push("Age must be a number between 13 and 120");
  }

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  next();
};
// ====================================================================================================== //
// ====================================================================================================== //
// ====================================================================================================== //
//                                    MIDDLEWARE: VALIDARE LOGIN
// ====================================================================================================== //
export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email, password } = req.body;
  const errors: string[] = [];

  // CHECK DEI CAMPI
  if (!email) errors.push("Email is required");
  if (!password) errors.push("Password is required");

  if (!isValidEmail(email)) {
    errors.push("Invalid Email format");
  }

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  next();
};
// ====================================================================================================== //
// ====================================================================================================== //
