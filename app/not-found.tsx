import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
      <h2 className="text-3xl font-bold mb-4">404 - Page non trouvée / الصفحة غير موجودة</h2>
      <p className="text-slate-400 mb-6">La page que vous recherchez n&apos;existe pas.</p>
      <Link
        href="/"
        className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-medium rounded-xl transition"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
