import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const paymentCreate = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { amount, currency = 'INR', orderData } = req.body;

    // Validate required fields
    if (!amount || !orderData) {
      return res.status(400).json({ 
        message: 'Amount and order data are required' 
      });
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount), // amount in paise
      currency,
      receipt: orderData.orderCode,
      notes: {
        userId: orderData.userId,
        email: orderData.email,
        customerName: `${orderData.firstName} ${orderData.lastName}`,
      },
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    });

  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message,
    });
  }
}



const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData
    } = req.body;

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed - Invalid signature'
      });
    }

    // Get payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    
    if (payment.status !== 'captured') {
      return res.status(400).json({
        success: false,
        message: 'Payment not captured'
      });
    }

    // Save order to database
    const orderToSave = {
      ...orderData,
      paymentStatus: 'completed',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      paymentSignature: razorpay_signature,
      paymentMethod: 'razorpay',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save to your database
    // Example:
    // const savedOrder = await Order.create(orderToSave);
    
    // For now, we'll use your existing API endpoint
    try {
      // You can make an internal API call to your existing order creation endpoint
      const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/dashboard/addOrder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderToSave),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to save order to database');
      }

      const savedOrder = await orderResponse.json();

      res.status(200).json({
        success: true,
        message: 'Payment verified and order saved successfully',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        order: savedOrder,
      });

    } catch (dbError) {
      console.error('Database save error:', dbError);
      // Payment was successful but order save failed
      // You might want to handle this case differently
      res.status(500).json({
        success: false,
        message: 'Payment successful but failed to save order. Please contact support.',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
      });
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message,
    });
  }
}