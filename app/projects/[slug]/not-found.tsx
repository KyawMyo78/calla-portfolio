import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
  <div className="min-h-screen bg-gradient-to-br from-clover-100 via-white to-secondary-50 flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <Search size={120} className="mx-auto text-clover-300 mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold text-clover-900 mb-4">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-clover-700 mb-4">
            Project Not Found
          </h2>
          <p className="text-lg text-clover-700 mb-8">
            The project you're looking for doesn't exist or may have been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/projects"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-clover-700 text-white rounded-lg hover:bg-clover-900 transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Projects
            </Link>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-clover-700 border border-clover-300 rounded-lg transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
