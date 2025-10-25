import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import api from '../services/api';

export default function Confirm(){
  const { cart, total } = useContext(CartContext);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const nav = useNavigate();

  const handleConfirm = async () => {
    const payload = {
      items: cart.map(i => ({ product: i.product, quantity: i.quantity, price: i.price, seller: i.seller, store: i.store })),
      address, phone, payment: 'cash'
    };
    await api.post('/orders', payload);
    nav('/payment', { state: { total } });
  };

  return (
    <div>
      <h2>Confirm Order</h2>
      <input value={address} onChange={e=>setAddress(e.target.value)} placeholder="Address" />
      <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone" />
      <p>Total: ₹{total}</p>
      <button onClick={handleConfirm}>Confirm & Pay</button>
    </div>
  )
}
