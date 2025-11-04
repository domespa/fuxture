import { Request, Response } from "express";
import { hashPassword, comparePassword } from "../utils/password";
import { prisma } from "../config/database";
import { generateToken } from "../utils/jwt";
import type {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
} from "../types/auth.types";

// ====================================================================================================== //
//                                              HELPER
// ====================================================================================================== //
// USER => RESPONSE
const createAuthResponse = (user: any, token: string): AuthResponse => {
  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
    token,
  };
};
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                              REGISTRAZIONE
// ====================================================================================================== //
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // PRENDIAMO I DATI DAL BODY
    const { email, password, firstName, lastName, age, acceptedTerms } =
      req.body as RegisterRequest;

    // CONTROLLIAMO SE L'EMAIL ESISTE
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    // HASHIAMO LA PW
    const passwordHashed = await hashPassword(password);

    // CREAIMO L'UTENTE
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHashed,
        firstName,
        lastName,
        age,
        role: "USER",
        acceptedTerms,
        acceptedTermsAt: new Date(),
      },
    });

    // GENERIAMO IL TOKEN
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    // RITORNIAMO LA RISPOSTA
    const response = createAuthResponse(newUser, token);
    res.status(201).json(response);
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
// ====================================================================================================== //
// ====================================================================================================== //
// ====================================================================================================== //
//                                              LOGIN
// ====================================================================================================== //
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // PRENDIAMO I DATI DAL BODY
    const { email, password } = req.body as LoginRequest;

    // CERCHIAMO L'UTENTE NEL DB
    const user = await prisma.user.findUnique({
      where: { email },
    });

    //  SE NON ESISTE TORNIAMO UN ERRORE
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // VERIFICHIAMO LA PW
    const isValidPassword = await comparePassword(
      password,
      user.passwordHashed
    );

    if (!isValidPassword) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // GENERIAMO IL TOKEN
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // RITORNIAMO LA RISPOSTA
    const response = createAuthResponse(user, token);
    res.status(200).json(response);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
// ====================================================================================================== //
// ====================================================================================================== //
