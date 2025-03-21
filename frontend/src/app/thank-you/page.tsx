import { FC } from "react";

const ThankYouPage: FC = () => (
    <div className="flex flex-col w-screen items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-6">Thank You!</h1>
      <p className="text-lg text-gray-700 text-center max-w-xl">
        Your quiz has been submitted successfully. Our team will carefully review your responses, and we will get back to you with the results shortly. Thank you for your time and effort.
      </p>
    </div>
  );

export default ThankYouPage;