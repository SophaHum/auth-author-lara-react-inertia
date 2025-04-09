import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { usePage } from '@inertiajs/react';

export function Toast() {
  const { flash } = usePage().props as any;
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('');

  useEffect(() => {
    if (flash?.success) {
      setMessage(flash.success);
      setType('success');
      setVisible(true);
    } else if (flash?.error) {
      setMessage(flash.error);
      setType('error');
      setVisible(true);
    }

    if (visible) {
      const timer = setTimeout(() => {
        setVisible(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [flash, visible]);

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg flex items-center justify-between gap-4 z-50 max-w-sm
        ${type === 'success' ? 'bg-green-100 text-green-800 border-l-4 border-green-500' : ''}
        ${type === 'error' ? 'bg-red-100 text-red-800 border-l-4 border-red-500' : ''}
      `}
    >
      <div>{message}</div>
      <button
        onClick={() => setVisible(false)}
        className="text-gray-500 hover:text-gray-700"
      >
        <X size={16} />
      </button>
    </div>
  );
}

// Basic toast function with operation-specific styling
interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'create' | 'update' | 'delete' | 'error' | 'default';
}

export const toast = ({ title, description, variant = "default" }: ToastOptions) => {
    // Define color schemes based on operation type
    const variantClasses = {
        // Success variants by operation
        create: "bg-green-100 text-green-800 border border-green-300",
        update: "bg-blue-100 text-blue-800 border border-blue-300",
        delete: "bg-purple-100 text-purple-800 border border-purple-300",

        // Error variant
        error: "bg-red-100 text-red-800 border border-red-300",

        // Default/fallback variant
        default: "bg-gray-100 text-gray-800 border border-gray-300"
    };

    // Get the appropriate class based on the variant
    const colorClass = variantClasses[variant] || variantClasses.default;

    // Create the notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-md shadow-md max-w-md z-50 ${colorClass}`;

    // Create title element
    if (title) {
        const titleElement = document.createElement('h3');
        titleElement.className = 'font-medium';
        titleElement.textContent = title;
        notification.appendChild(titleElement);
    }

    // Create description element
    if (description) {
        const descElement = document.createElement('p');
        descElement.className = 'text-sm';
        descElement.textContent = description;
        notification.appendChild(descElement);
    }

    // Add to DOM
    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('opacity-0', 'transition-opacity');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
};
