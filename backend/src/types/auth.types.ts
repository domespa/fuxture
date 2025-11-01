// QUELLO CHE RACCOGLIAMO DURANTE LA REGISTRAZIONW
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  age: number;
  acceptedTerms: boolean;
}

// QUELLO CHE SERVE PER LOGGARE
export interface LoginRequest {
  email: string;
  password: string;
}

// QUELLO CHE TORNIAMO AL FE
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  token: string;
}

// QUELLO CHE CI SARà DENTRO IL TOKEN
export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}
