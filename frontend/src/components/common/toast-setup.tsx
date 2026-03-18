'use client';

import { Toaster, ToastBar, toast } from 'react-hot-toast';

export function ToastSetup() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 5000,
        style: {
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        },
      }}
    >
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => (
            <div className="flex w-full items-start gap-3">
              <div className="flex flex-1 items-start gap-3">
                {icon}
                <div>{message}</div>
              </div>
              <button
                type="button"
                onClick={() => toast.dismiss(t.id)}
                className="text-base leading-none opacity-70 transition-opacity hover:opacity-100"
                aria-label="Close notification"
              >
                x
              </button>
            </div>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
}
