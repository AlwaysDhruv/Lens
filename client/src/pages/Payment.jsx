import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { useContext } from 'react';

export default function Payment(){
  const { clearCart } = useContext(CartContext);
  const loc = useLocation();
  const nav = useNavigate();
  const total = loc.state?.total || 0;

  const finish = () => {
    clearCart();
    nav('/home');
  };

  return (
    <div>
      <h2>Payment</h2>
      <p>Amount: ₹{total}</p>
      <p>Payment simulated. Choose UPI or Cash in confirm flow (backend saved it).</p>
      <button onClick={finish}>Finish</button>
    </div>
  );
}
