import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center px-6">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-white mb-6">CityHero</h1>
        <p className="text-xl text-indigo-100 mb-10">
          Plataforma inteligente de manutenção urbana. Conectando cidadãos e
          prefeituras para cidades mais eficientes.
        </p>
        <Link
          href="/login"
          className="inline-block bg-white text-indigo-600 font-semibold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-indigo-50 transition-all"
        >
          Acessar Painel
        </Link>
      </div>
    </main>
  );
}
