import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authAPI } from "@/services/api";
import type { RegisterRequest } from "@/types/auth.types";

// ZOD
const registerSchema = z.object({
  email: z.string().min(1, "Email è obbligatoria").email("Email non valida"),
  password: z
    .string()
    .min(8, "Password deve essere almeno 8 caratteri")
    .regex(/[A-Z]/, "Password deve contenere almeno una maiuscola")
    .regex(/[a-z]/, "Password deve contenere almeno una minuscola")
    .regex(/[0-9]/, "Password deve contenere almeno un numero"),
  firstName: z.string().min(2, "Nome deve essere almeno 2 caratteri"),
  lastName: z.string().min(2, "Cognome deve essere almeno 2 caratteri"),
  age: z
    .number()
    .min(13, "Devi avere almeno 13 anni")
    .max(120, "Età non valida"),
  acceptedTerms: z.boolean().refine((val) => val === true, {
    message: "Devi accettare i termini e condizioni",
  }),
});

type RegisterFormData = z.infer<typeof registerSchema>;

// ======================================================================================
//                                  COMPONENTE
// ======================================================================================
export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // REACTHOOKFORM CON ZOD
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // SUBMIT
  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // CHIAMATA API
      const response = await authAPI.register(data as RegisterRequest);

      // SALVIAMO TOKEN E USER NELLO STORAGE
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      console.log("Registration successful!", response);
      alert("Registrazione riuscita! Token salvato.");

      navigate("/dashboard");
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(
        err.response?.data?.message || "Errore durante la registrazione"
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Registrazione
          </CardTitle>
          <CardDescription className="text-center">
            Crea un nuovo account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tua@email.com"
                {...register("email")}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Nome e Cognome */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Mario"
                  {...register("firstName")}
                  disabled={isLoading}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-600">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Cognome</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Rossi"
                  {...register("lastName")}
                  disabled={isLoading}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-600">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Età */}
            <div className="space-y-2">
              <Label htmlFor="age">Età</Label>
              <Input
                id="age"
                type="number"
                placeholder="25"
                {...register("age", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.age && (
                <p className="text-sm text-red-600">{errors.age.message}</p>
              )}
            </div>

            {/* Termini e Condizioni */}
            <div className="flex items-start space-x-2">
              <input
                id="acceptedTerms"
                type="checkbox"
                className="mt-1"
                {...register("acceptedTerms")}
                disabled={isLoading}
              />
              <Label
                htmlFor="acceptedTerms"
                className="text-sm font-normal cursor-pointer"
              >
                Accetto i termini e le condizioni
              </Label>
            </div>
            {errors.acceptedTerms && (
              <p className="text-sm text-red-600">
                {errors.acceptedTerms.message}
              </p>
            )}

            {/* Errore generale */}
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Registrazione in corso..." : "Registrati"}
            </Button>
          </form>

          {/* Link a Login */}
          <div className="mt-4 text-center text-sm text-gray-600">
            Hai già un account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:underline"
            >
              Accedi
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
