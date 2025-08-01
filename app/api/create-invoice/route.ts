import { NextRequest, NextResponse } from 'next/server';
import { getItemById } from '@/app/data/items';
import { v4 as uuidv4 } from 'uuid';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const { userId , stars } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'Missing required fields: userId' }, { status: 400 });
    }
    if (stars <= 0 || stars > 500) {
      return NextResponse.json({ error: 'Invalid stars value' }, { status: 401 });
    }
    // Extract item details
    const title = "Mahjong Game Ticket";
    const description = "Ticket for one mahjong game";
    const price = stars;

    // Get the BOT_TOKEN from environment variables
    const BOT_TOKEN = process.env.BOT_TOKEN;
    
    if (!BOT_TOKEN) {
      return NextResponse.json({ error: 'Bot token not configured' }, { status: 500 });
    }

    // generate a unique ID
    const payload = uuidv4();
    // Store in database with pending status
    const client = await connectToDatabase();
    const db = client.db('mahjong_game');
    const paymentCollection = db.collection('payment');
    await paymentCollection.insertOne({
      payload,
      userId,
      stars,
      status: 'pending',
      charge_id: null,
      createdAt: new Date(),
    })
    
    // create an invoice link
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/createInvoiceLink`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        payload, // In production, use a JSON string with a unique request ID
        provider_token: '', // Empty for Telegram Stars payments
        currency: 'XTR',    // Telegram Stars currency code
        prices: [{ label: title, amount: price }],
        start_parameter: "start_parameter" // Required for some clients
      })
    });

    // PRODUCTION IMPLEMENTATION:
    // In a real production app:
    // 1. Generate a unique ID for this payment request
    // const requestId = generateUniqueId();
    // 
    // 2. Store it in your database with the pending status
    // await db.paymentRequests.create({
    //   requestId,
    //   userId,
    //   itemId,
    //   status: 'pending',
    //   createdAt: Date.now()
    // });
    // 
    // 3. Include this ID in the invoice payload
    // const payload = JSON.stringify({ requestId });
    //
    // 4. Configure your bot's webhook to handle payment_successful updates
    // and update the database with the real telegram_payment_charge_id when payment is complete
    // 
    // 5. After the WebApp.openInvoice callback indicates 'paid', query your database 
    // using the requestId to get the real transaction ID for successful payments

    // Create an actual invoice link by calling the Telegram Bot API
    

    const data = await response.json();
    
    if (!data.ok) {
      console.error('Telegram API error:', data);
      return NextResponse.json({ error: data.description || 'Failed to create invoice' }, { status: 500 });
    }
    
    const invoiceLink = data.result;
    
    /* const paymentUpdateResponse = await fetch('https://a41b13ff0c3d.ngrok-free.app/payment-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        payload: uniqueId, // In production, use a JSON string with a unique request ID
        provider_token: '', // Empty for Telegram Stars payments
        currency: 'XTR',    // Telegram Stars currency code
        prices: [{ label: title, amount: price }],
        start_parameter: "start_parameter" // Required for some clients
      })
    });

    if (!paymentUpdateResponse.ok) {
      console.error('Failed to notify Socket.io server');
      return NextResponse.json({ error: 'Failed to connect the database' }, { status: 500 })
    } */

    // We don't store the purchase yet - that will happen after successful payment
    // We'll return the invoice link to the frontend
    return NextResponse.json({ invoiceLink, payload });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
} 
