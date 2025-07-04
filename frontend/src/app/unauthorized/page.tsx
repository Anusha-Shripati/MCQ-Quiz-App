import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unauthorized',
};

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6 w-full">
      <h1 className="text-4xl font-bold text-red-600 mb-4">Access Denied</h1>
      <p className="text-lg text-gray-700 mb-6">You don&apos;t have permission to view this page.</p>
      <Link href="/dashboard" className="bg-blue-500 text-white px-6 py-2 rounded-lg">
        Go to Dashboard
      </Link>
    </div>
  );
}
