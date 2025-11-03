const router = require('express').Router();
const sendEmail = require('../utils/sendEmail');
const Contact = require('../models/Contact');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');

router.get('/messages', auth, roles(['admin']), async (req, res) =>
{
  try
  {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json(messages);
  }
  catch (err)
  {
    res.status(500).json({ msg: err.message });
  }
});

router.post('/', async (req, res) =>
{
  try
  {
    const { name, email, message } = req.body;
    if (!name || !email || !message)
      return res.status(400).json({ msg: 'All fields are required' });

    const newMessage = new Contact({ name, email, message });
    await newMessage.save();

    const subject = `New Contact Message from ${name}`;
    const content = `
      <h3>Lens Gallery Contact Form</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `;

    await sendEmail(process.env.CONTACT_EMAIL, subject, '', content);

    res.json({ msg: 'Message sent to admin successfully' });
  }
  catch (err)
  {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;