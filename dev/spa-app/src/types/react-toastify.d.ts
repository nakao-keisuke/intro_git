import 'react-toastify';

declare module 'react-toastify' {
  export interface ToastOptions<TData = any> {
    draggableDirection?: 'x' | 'y';
  }
}
