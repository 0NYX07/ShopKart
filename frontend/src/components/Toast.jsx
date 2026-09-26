import React from 'react';
import { useCart } from '../context/CartContext';

function Toast() {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="toast-notification">
      <div className="toast-icon">✓</div>
      <div className="toast-content">{toastMessage}</div>
    </div>
  );
}

export default Toast;
