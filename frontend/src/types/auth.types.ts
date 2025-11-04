// REQUEST CHE MANDIAMO AL BE
export interface LoginRequest {
  email: string;
  password: string;
}

// REQUEST CHE MANDIAMO AL BE PER LA REGISTRAZIONE DEGLI UTENTI
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  age: number;
  acceptedTerms: boolean;
}

// LA RESPONSE CHE RICEVIAMO DAL BE
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: "ADMIN" | "USER";
  };
}

// IPOTETICI ERRORI
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
