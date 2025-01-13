export default function Loading() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="flex space-x-4">
        <div className="w-8 h-8 border-4 border-t-4 border-blue-500 rounded-full animate-spin"></div>
        <span className="text-xl text-gray-600">Loading...</span>
      </div>
    </div>
  );
}

