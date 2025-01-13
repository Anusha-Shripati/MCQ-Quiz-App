import Link from "next/link";
import React from "react";

export default function Home() {
  return (
    <div className="bg-gradient-to-r from-gray-700 to-gray-900 h-screen w-screen flex flex-col items-center justify-center">
      <div className="text-6xl font-bold text-white">MCQ APP</div>
      <div className="text-xl text-white mt-4">
        <p className="text-center">
          Client app is still in work in progress. Please visit the admin app.
        </p>
        <p className="mt-8 text-center">
          <Link href="/dashboard">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Admin App
            </button>
          </Link>
        </p>
      </div>
    </div>
  );
}
