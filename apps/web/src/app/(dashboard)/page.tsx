"use client";

import { useEffect, useState } from "react";

import type { User } from "@city-hero/types";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<User>("/users/me")
      .then(setUser)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-gray-400">Carregando...</p>;
  }

  if (!user) {
    return <p className="text-red-500">Erro ao carregar dados do usuário.</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Bem-vindo, {user.name}!
      </h1>
      <p className="text-gray-500 mb-8">
        Painel de gestão urbana inteligente.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
          <p className="text-lg font-semibold text-gray-900">{user.email}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Membro desde</h3>
          <p className="text-lg font-semibold text-gray-900">
            {new Date(user.createdAt).toLocaleDateString("pt-BR")}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
          <p className="text-lg font-semibold text-green-600">Ativo</p>
        </div>
      </div>
    </div>
  );
}
