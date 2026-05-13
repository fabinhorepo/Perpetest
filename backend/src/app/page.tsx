import { createSuccessResponse } from '@/lib/api';

export default function Home() {
  return (
    <main className="min-h-screen bg-green-50">
      {/* Header */}
      <header className="bg-green-700 text-white py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold">🌱 Mata Sagrada Ambiental</h1>
          <p className="text-green-100 mt-2">Marketplace de mudas florestais para restauração ambiental</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto py-12 px-4">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-green-800 mb-4">Bem-vindo ao Perpetest</h2>
            <p className="text-gray-600 mb-4">
              Plataforma completa para e-commerce de mudas florestais com logística otimizada e recomendação inteligente.
            </p>
            <p className="text-gray-600">
              Gestione seus projetos de restauração ambiental com eficiência, desde a seleção de espécies adequadas até a entrega otimizada.
            </p>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-green-600">
            <h3 className="text-xl font-bold text-green-700 mb-2">🛒 Catálogo Inteligente</h3>
            <p className="text-gray-600">
              Navegue por mudas florestais filtradas por bioma, grupo ecológico e velocidade de crescimento.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-600">
            <h3 className="text-xl font-bold text-blue-700 mb-2">🚚 Logística Otimizada</h3>
            <p className="text-gray-600">
              Cálculo de frete inteligente com opções de entrega e otimização de rotas.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-purple-600">
            <h3 className="text-xl font-bold text-purple-700 mb-2">🎯 Recomendações</h3>
            <p className="text-gray-600">
              Sugestões personalizadas baseadas nas características do seu projeto.
            </p>
          </div>
        </section>

        {/* API Status */}
        <section className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Status dos Serviços</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Backend API</h3>
              <p className="text-sm text-gray-600">http://localhost:3000</p>
              <a href="/api/health" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                Verificar saúde →
              </a>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Serviço de Recomendação</h3>
              <p className="text-sm text-gray-600">http://localhost:8001</p>
              <p className="text-xs text-yellow-600 mt-2">Disponível em breve</p>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Serviço de Entrega</h3>
              <p className="text-sm text-gray-600">http://localhost:8002</p>
              <p className="text-xs text-yellow-600 mt-2">Disponível em breve</p>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">PostgreSQL</h3>
              <p className="text-sm text-gray-600">localhost:5432</p>
              <p className="text-xs text-green-600 mt-2">✓ Conectado</p>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="mt-12 bg-green-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Começar</h2>
          <ul className="grid md:grid-cols-2 gap-4">
            <li>
              <a href="/api/catalog/species" className="text-blue-600 hover:underline">
                📚 Ver Espécies Disponíveis
              </a>
            </li>
            <li>
              <a href="/api/catalog/products" className="text-blue-600 hover:underline">
                🌿 Ver Produtos
              </a>
            </li>
            <li>
              <a href="/api/catalog/bundles" className="text-blue-600 hover:underline">
                📦 Ver Bundles Recomendados
              </a>
            </li>
            <li>
              <a href="https://github.com/your-repo" className="text-blue-600 hover:underline">
                💻 Ver Código no GitHub
              </a>
            </li>
          </ul>
        </section>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t text-center text-gray-600">
          <p>🌍 Perpetest - Plataforma de Restauração Ambiental</p>
          <p className="text-sm mt-2">Desenvolvido com ❤️ para a conservação</p>
        </footer>
      </div>
    </main>
  );
}
