import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(req: NextRequest) {
    const BOT_TOKEN = process.env.BOT_TOKEN!
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL!

    try {
        const update = await req.json()

        // Handle pre-checkout query (payment confirmation)
        if (update.pre_checkout_query) {
            const query = update.pre_checkout_query

            // Always approve in this demo
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerPreCheckoutQuery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pre_checkout_query_id: query.id,
                    ok: true
                })
            })

            return NextResponse.json({ ok: true })
        }

        // Handle successful payment
        if (update.message?.successful_payment) {
            const payment = update.message.successful_payment;
            const userId = update.message.from.id;
            const payload = payment.invoice_payload;
            const chargeId = payment.telegram_payment_charge_id;

            // Store payment receipt
            const client = await connectToDatabase();
            const db = client.db('mahjong_game');
            const paymentCollection = db.collection('payment');
  
            await paymentCollection.updateOne(
                { payload },
                { $set: { status: "Success", charge_id: chargeId } }
            );

            // Send confirmation message
            await sendTelegramMessage(
                userId,
                `✅ *Payment Successful!*\n\n` +
                `You purchased for *${payment.total_amount} Stars*!\n\n` +
                `Receipt ID: \`${payment.telegram_payment_charge_id}\`\n\n` +
                `_To test refunds, use:_\n` +
                `\`/refund ${payment.telegram_payment_charge_id}\``,
                { parse_mode: 'Markdown' }
            )

            return NextResponse.json({ ok: true })
        }

        // Handle successful refund
        if (update.message?.refunded_payment) {
            const refund = update.message.refunded_payment;
            const payload = refund.invoice_payload;

            // Update database
            const client = await connectToDatabase();
            const db = client.db('mahjong_game');
            const paymentCollection = db.collection('payment');

            await paymentCollection.updateOne(
                { payload },
                { $set: { status: "Refunded" } }
            );
        }

        // Handle /refund command
        if (update.message?.text?.startsWith('/refund')) {
            const parts = update.message.text.split(' ')
            const receiptId = parts[1]
            const userId = update.message.from.id

            if (!receiptId) {
                await sendTelegramMessage(
                    userId,
                    '❌ Please provide a receipt ID:\n`/refund YOUR_RECEIPT_ID`',
                    { parse_mode: 'Markdown' }
                )
                return NextResponse.json({ ok: true })
            }

            // Process refund
            const refundResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/refundStarPayment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    telegram_payment_charge_id: receiptId
                })
            })

            const refundData = await refundResponse.json()

            if (refundData.ok) {
                await sendTelegramMessage(
                    userId,
                    `✅ *Refund Successful!*\n\n` +
                    `_Thank you for testing the payment system!_`,
                    { parse_mode: 'Markdown' }
                )
            } else {
                await sendTelegramMessage(
                    userId,
                    `❌ Refund failed: ${refundData.description || 'Unknown error'}`,
                    { parse_mode: 'Markdown' }
                )
            }

            return NextResponse.json({ ok: true })
        }

        // Handle /start command
        if (update.message?.text === '/start') {
            await sendTelegramMessage(
                update.message.chat.id,
                '🎮 *Welcome to Points Game!*\n\n' +
                'Collect points and compete with friends!\n\n' +
                '🎁 Daily rewards\n' +
                '💎 Buy points with Stars (real payments!)\n' +
                '💸 Test refunds with `/refund`\n\n' +
                'Tap the button below to play!',
                {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [[
                            { text: '🎮 Play Game', web_app: { url: APP_URL } }
                        ]]
                    }
                }
            )
        }

        // Handle /help command
        if (update.message?.text === '/help') {
            const result = await sendTelegramMessage(
                update.message.chat.id,
                '❓ *How to Play*\n\n' +
                '1️⃣ Open the game from the button\n' +
                '2️⃣ Claim daily points\n' +
                '3️⃣ Buy more points with Stars\n' +
                '4️⃣ Test refunds with receipt ID\n\n' +
                '*Commands:*\n' +
                '/start - Start the game\n' +
                '/help - Show this help\n' +
                '/refund RECEIPT\\_ID - Refund a payment',  // Escaped underscore
                { parse_mode: 'Markdown' }
            )
        }

        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json({ error: 'Error' }, { status: 500 })
    }
}

async function sendTelegramMessage(chatId: number, text: string, extra?: any) {
    const BOT_TOKEN = process.env.BOT_TOKEN

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text,
            ...extra
        })
    })

    const data = await response.json()

    if (!data.ok) {
        console.error('Telegram API error:', data)
    }

    return data
}