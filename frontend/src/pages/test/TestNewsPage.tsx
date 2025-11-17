import NewsWidget from "../../components/blog/components/NewsWidget";

export default function TestNewsPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-center text-gray-900">
          Test News Widget
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Widget notizie in tempo reale dall'Italia
        </p>
        <NewsWidget />
      </div>
    </div>
  );
}
