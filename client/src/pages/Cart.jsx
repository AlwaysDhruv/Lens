import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

export default function Cart(){
  const { cart, updateQty, removeFromCart, total } = useContext(CartContext);
  const nav = useNavigate();

  return (
    <div>
      <h2>Your Cart</h2>
      {cart.length === 0 ? <p>Cart empty. <Link to="/home">Shop</Link></p> : (
        <>
          {cart.map(i => (
            <div key={i.product} className="cart-item">
              <strong>{i.name}</strong>
              <input type="number" value={i.quantity} min="1"
                onChange={(e)=> updateQty(i.product, Number(e.target.value))} />
              <span>₹{i.price * i.quantity}</span>
              <button onClick={()=> removeFromCart(i.product)}>Remove</button>
            </div>
          ))}
          <h3>Total: ₹{total}</h3>
          <button onClick={()=> nav('/confirm')}>Proceed to Confirm</button>
        </>
      )}
    </div>
  )
}
