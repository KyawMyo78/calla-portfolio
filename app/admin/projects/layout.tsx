import { ReactNode } from 'react';

export default function ProjectsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fafafa' }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <a 
                href="/admin/dashboard" 
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                ← Back to Dashboard
              </a>
              <span className="text-gray-300">|</span>
              <h1 className="text-xl font-semibold text-gray-900">Projects Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                View Portfolio
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
