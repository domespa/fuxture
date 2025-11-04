export default function Dashboard() {
  // PRENDIAMO I DATI DAL TOKEN
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Dashboard Admin</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>

          {user ? (
            <div className="space-y-4">
              <p className="text-lg">
                Benvenuto,{" "}
                <span className="font-semibold">
                  {user.firstName} {user.lastName}
                </span>
                !
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Email:</span>{" "}
                  <span className="font-medium">{user.email}</span>
                </div>
                <div>
                  <span className="text-gray-600">Ruolo:</span>{" "}
                  <span className="font-medium">{user.role}</span>
                </div>
              </div>

              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
                <p className="text-blue-800">
                  🎉 Sei loggato! Questa è una route protetta.
                </p>
              </div>
            </div>
          ) : (
            <p>Nessun utente trovato. Effettua il login.</p>
          )}
        </div>
      </div>
    </div>
  );
}
