import toast from 'react-hot-toast';

export const showToast = {
  create: (message: string) => toast.success(`Created: ${message}`),
  edit: (message: string) => toast.success(`Updated: ${message}`),
  delete: (message: string) => toast.success(`Deleted: ${message}`),
  warning: (message: string) => toast.error(`Warning: ${message}`),
  unauthenticated: (message: string = 'Session expired. Please log in.') =>
    toast.error(`Unauthorized: ${message}`),
  apiError: (message: string = 'Server error occurred') =>
    toast.error(`API Error: ${message}`),
};
