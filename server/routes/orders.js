const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');

let sendMail = null;
try
{
  const m = require('../utils/sendEMail');
  sendMail = typeof m === 'function' ? m : (m && typeof m.default === 'function' ? m.default : null);
}
catch (err)
{
  console.warn('Warning: ../utils/sendEMail not found or failed to load. Email notifications will be skipped.', err.message || err);
}

async function safeSendEmail(to, subject, text, html)
{
  if (typeof sendMail === 'function')
  {
    try
    {
      await sendMail(to, subject, text, html);
    }
    catch (err)
    {
      console.error('sendMail failed:', err);
    }
  }
  else
  {
    console.warn(`sendMail not configured. Skipping email to ${to} with subject "${subject}".`);
  }
}

async function populateOrder(orderId)
{
  return Order.findById(orderId)
    .populate({ path: 'items.product', select: 'name imageUrl stock price' })
    .populate({ path: 'items.seller', select: 'name email' })
    .populate({ path: 'items.store', select: 'name' })
    .populate({ path: 'buyer', select: 'name email' });
}

async function notifyOnOrderPlaced(order)
{
  const populated = await populateOrder(order._1d || order._id);

  const buyer = populated.buyer;
  const buyerLines = populated.items.map(it =>
    `<li>${it.product?.name || 'Deleted product'} — Qty: ${it.quantity} — ₹${it.price} — Store: ${it.store?.name || '—'}</li>`
  ).join('');
  const buyerHtml = `
    <p>Hi ${buyer.name},</p>
    <p>Thanks — your order <strong>${populated._id}</strong> has been placed.</p>
    <p><strong>Order details:</strong></p>
    <ul>${buyerLines}</ul>
    <p><strong>Total:</strong> ₹${populated.total}</p>
    <p>We'll notify you as sellers update the status.</p>
  `;
  await safeSendEmail(buyer.email, `Order placed — ${populated._id}`, `Your order ${populated._id} was placed.`, buyerHtml);

  const sellers = {};
  for (const it of populated.items)
  {
    const sid = it.seller?._id?.toString() || it.seller?.toString();
    if (!sid) continue;
    if (!sellers[sid]) sellers[sid] = { seller: it.seller, items: [] };
    sellers[sid].items.push(it);
  }

  for (const sid of Object.keys(sellers))
  {
    const { seller, items } = sellers[sid];
    const sellerEmail = seller?.email;
    if (!sellerEmail) continue;

    const itemLines = items.map(it =>
      `<li>${it.product?.name || 'Deleted product'} — Qty: ${it.quantity} — ₹${it.price} — Buyer: ${populated.buyer?.name || '—'}</li>`
    ).join('');

    const sellerHtml = `
      <p>Hi ${seller.name || 'Seller'},</p>
      <p>You have a new order <strong>${populated._id}</strong> with the following items to fulfill:</p>
      <ul>${itemLines}</ul>
      <p>Buyer: ${populated.buyer?.name || '—'} (${populated.buyer?.email || '—'})</p>
      <p>Please update item status as you process the order (confirmed → shipped → out_for_delivery → delivered).</p>
    `;
    await safeSendEmail(sellerEmail, `New order assigned — ${populated._id}`, `You have new items to fulfill for order ${populated._id}`, sellerHtml);
  }
}

async function notifyCancellationRequested(order, affectedItemIds = null)
{
  const populated = await populateOrder(order._id);
  const buyer = populated.buyer;

  const buyerHtml = `
    <p>Hi ${buyer.name},</p>
    <p>Your cancellation request for order <strong>${populated._id}</strong> has been sent to the seller(s). They will review and approve/deny the request.</p>
    <p>Requested items:</p>
    <ul>
      ${populated.items
        .filter(i => i.status === 'cancellation_requested' && (!affectedItemIds || affectedItemIds.includes(i._id.toString())))
        .map(i => `<li>${i.product?.name || 'Deleted product'} — Qty: ${i.quantity} — Seller: ${i.seller?.name || '—'}</li>`).join('')}
    </ul>
  `;
  await safeSendEmail(buyer.email, `Cancellation requested — ${populated._id}`, `Your cancellation request for ${populated._id} was sent.`, buyerHtml);

  const sellers = {};
  for (const it of populated.items)
  {
    if (it.status !== 'cancellation_requested') continue;
    if (affectedItemIds && !affectedItemIds.includes(it._id.toString())) continue;

    const sid = it.seller?._id?.toString() || it.seller?.toString();
    if (!sid) continue;
    if (!sellers[sid]) sellers[sid] = { seller: it.seller, items: [] };
    sellers[sid].items.push(it);
  }

  for (const sid of Object.keys(sellers))
  {
    const { seller, items } = sellers[sid];
    const sellerEmail = seller?.email;
    if (!sellerEmail) continue;

    const itemLines = items.map(i => `<li>${i.product?.name || 'Deleted product'} — Qty: ${i.quantity} — Order: ${populated._id}</li>`).join('');
    const sellerHtml = `
      <p>Hi ${seller.name},</p>
      <p>The buyer requested cancellation for the following item(s) in order <strong>${populated._id}</strong>:</p>
      <ul>${itemLines}</ul>
      <p>To approve cancellation, mark the item status as <code>cancelled</code> in your seller dashboard. If you approve, stock will be restored automatically.</p>
    `;
    await safeSendEmail(sellerEmail, `Cancellation request received — ${populated._id}`, `Buyer requested cancellation for items in order ${populated._id}`, sellerHtml);
  }
}

async function notifyStatusChange(order, item)
{
  const populated = await populateOrder(order._id);
  const buyer = populated.buyer;

  const seller = await User.findById(item.seller);
  const sellerEmail = seller?.email;
  const buyerEmail = buyer?.email;

  const buyerHtml = `
    <p>Hi ${buyer.name},</p>
    <p>The status for item <strong>${item.product?.name || item.product}</strong> in order <strong>${order._id}</strong> has been updated to <strong>${item.status.replace(/_/g,' ')}</strong> by the seller.</p>
    <p>Qty: ${item.quantity} · Price: ₹${item.price}</p>
    <p>If you have questions, contact the seller at ${seller?.name || 'seller'} (${seller?.email || '—'}).</p>
  `;
  await safeSendEmail(buyerEmail, `Order update — ${order._id}`, `Status updated for order ${order._id}`, buyerHtml);

  if (sellerEmail)
  {
    const sellerHtml = `
      <p>Hi ${seller.name || 'Seller'},</p>
      <p>You updated the status for item <strong>${item.product?.name || item.product}</strong> in order <strong>${order._id}</strong> to <strong>${item.status.replace(/_/g,' ')}</strong>.</p>
      <p>Buyer: ${buyer?.name || '—'} · ${buyer?.email || '—'}</p>
    `;
    await safeSendEmail(sellerEmail, `Status updated — ${order._id}`, `You updated item status for order ${order._id}`, sellerHtml);
  }
}

router.post('/', auth, roles(['buyer']), async (req, res) =>
{
  try
  {
    const { items, address, phone, payment } = req.body;
    let total = 0;

    for (const it of items)
    {
      const prod = await Product.findById(it.product);
      if (!prod) return res.status(400).json({ msg: `Product ${it.product} not found` });
      if (prod.stock < it.quantity) return res.status(400).json({ msg: `Insufficient stock for ${prod.name}` });

      total += prod.price * it.quantity;
      prod.stock -= it.quantity;
      await prod.save();
    }

    const normalizedItems = items.map(i => (
    {
      product: i.product,
      quantity: i.quantity,
      price: i.price,
      seller: i.seller,
      store: i.store,
      status: 'pending'
    }));

    const order = await Order.create(
    {
      buyer: req.user._id,
      items: normalizedItems,
      address,
      phone,
      payment,
      total
    });

    try
    {
      await notifyOnOrderPlaced(order);
    }
    catch (mailErr)
    {
      console.error('Email notify fail (order placed):', mailErr);
    }

    const populated = await populateOrder(order._id);
    res.status(201).json({ msg: 'Order placed', order: populated });
  }
  catch (err)
  {
    console.error('Order creation failed:', err);
    res.status(500).json({ msg: 'Failed to place order' });
  }
});

router.get('/buyer', auth, roles(['buyer']), async (req, res) =>
{
  try
  {
    const orders = await Order.find({ buyer: req.user._id })
      .sort({ createdAt: -1 })
      .populate({ path: 'items.product', select: 'name imageUrl' })
      .populate({ path: 'items.seller', select: 'name email' })
      .populate({ path: 'items.store', select: 'name' });

    res.json(orders);
  }
  catch (err)
  {
    console.error('Failed to fetch buyer orders:', err);
    res.status(500).json({ msg: 'Error fetching orders' });
  }
});

router.get('/seller', auth, roles(['seller']), async (req, res) =>
{
  try
  {
    const orders = await Order.find({ 'items.seller': req.user._id })
      .sort({ createdAt: -1 })
      .populate({ path: 'items.product', select: 'name imageUrl' })
      .populate({ path: 'items.seller', select: 'name email' })
      .populate({ path: 'items.store', select: 'name' })
      .populate({ path: 'buyer', select: 'name email' });

    res.json(orders);
  }
  catch (err)
  {
    console.error('Failed to fetch seller orders:', err);
    res.status(500).json({ msg: 'Error fetching seller orders' });
  }
});

router.put('/:id/request-cancellation', auth, roles(['buyer']), async (req, res) =>
{
  try
  {
    const { id } = req.params;
    const { itemId } = req.body;
    const order = await Order.findOne({ _id: id, buyer: req.user._id });

    if (!order) return res.status(404).json({ msg: 'Order not found' });

    let changed = false;
    const affected = [];
    for (const it of order.items)
    {
      if (itemId && it._id.toString() !== itemId) continue;
      if (['shipped', 'out_for_delivery', 'delivered', 'cancelled'].includes(it.status)) continue;
      if (it.status === 'cancellation_requested') continue;

      it.status = 'cancellation_requested';
      changed = true;
      affected.push(it._id.toString());
    }

    if (!changed) return res.status(400).json({ msg: 'No items eligible for cancellation' });

    await order.save();

    try
    {
      await notifyCancellationRequested(order, affected);
    }
    catch (mailErr)
    {
      console.error('Email notify fail (cancellation requested):', mailErr);
    }

    const populated = await populateOrder(order._id);
    res.json(populated);
  }
  catch (err)
  {
    console.error('Order cancellation request error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.put('/:orderId/items/:itemId/status', auth, roles(['seller']), async (req, res) =>
{
  try
  {
    const { orderId, itemId } = req.params;
    const { status } = req.body;
    const validStatuses = ['confirmed','shipped','out_for_delivery','delivered','cancelled'];

    if (!validStatuses.includes(status)) return res.status(400).json({ msg: 'Invalid status' });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ msg: 'Order not found' });

    const item = order.items.id(itemId);
    if (!item) return res.status(404).json({ msg: 'Order item not found' });

    if (item.seller.toString() !== req.user._id.toString())
    {
      return res.status(403).json({ msg: 'Not authorized to update this item' });
    }

    if (status === 'cancelled')
    {
      if (['shipped','out_for_delivery','delivered'].includes(item.status))
      {
        return res.status(400).json({ msg: 'Cannot cancel an item that has been shipped/delivered' });
      }

      const product = await Product.findById(item.product);
      if (product)
      {
        product.stock += item.quantity;
        await product.save();
      }

      item.status = 'cancelled';
      await order.save();

      try
      {
        await notifyStatusChange(order, item);
      }
      catch (mailErr)
      {
        console.error('Email notify fail (cancelled):', mailErr);
      }

      const populated = await populateOrder(order._id);
      return res.json({ msg: 'Cancellation approved and item cancelled', order: populated });
    }

    if (['delivered'].includes(item.status))
    {
      return res.status(400).json({ msg: 'Cannot change status of an item already delivered' });
    }

    item.status = status;
    await order.save();

    const statuses = order.items.map(i => i.status);
    if (statuses.every(s => s === 'delivered')) order.overallStatus = 'delivered';
    else if (statuses.every(s => s === 'cancelled')) order.overallStatus = 'cancelled';
    else if (statuses.some(s => ['shipped','out_for_delivery'].includes(s))) order.overallStatus = 'partially_shipped';
    else order.overallStatus = 'pending';
    await order.save();

    try
    {
      await notifyStatusChange(order, item);
    }
    catch (mailErr)
    {
      console.error('Email notify fail (status update):', mailErr);
    }

    const populated = await populateOrder(order._id);
    res.json({ msg: 'Item status updated', order: populated });
  }
  catch (err)
  {
    console.error('Seller update item status error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;