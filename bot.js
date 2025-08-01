require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const { MongoClient, Collection } = require("mongodb");
// Initialize bot
const bot = new Telegraf(process.env.BOT_TOKEN);
const BOT_TOKEN = process.env.BOT_TOKEN;
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';

async function connectToDatabase() {
    client = new MongoClient(uri);
    return client;
}

// Define items and messages (move to separate config file if preferred)
const ITEMS = {
  item1: {
    name: "Digital Item 1",
    description: "Premium digital content",
    price: 100
  },
  item2: {
    name: "Digital Item 2",
    description: "Special edition content",
    price: 200
  }
};

const MESSAGES = {
  welcome: "Welcome to our Star Payments bot! Choose an item to purchase:",
  help: "This bot allows you to purchase digital items using Telegram Stars.",
  refund_usage: "Usage: /refund <charge_id>",
  refund_success: "Refund processed successfully!",
  refund_failed: "Refund failed. Please check the charge ID and try again."
};

// Statistics tracking
const stats = {
  purchases: new Map(),
  refunds: new Map()
};

// Start command
bot.command('start', (ctx) => {
  const keyboard = Object.entries(ITEMS).map(([itemId, item]) => [
    Markup.button.callback(
      `${item.name} - ${item.price} ⭐`,
      itemId
    )
  ]);
  
  return ctx.reply(
    MESSAGES.welcome,
    Markup.inlineKeyboard(keyboard)
  );
});

// Help command
bot.command('help', (ctx) => {
  const roomDatalist = global.roomDatalist;
  return ctx.reply(String(roomDatalist.length));
});

// Refund command
bot.command('refund', async (ctx) => {
  const chargeId = ctx.message.text.split(' ')[1];
  
  if (!chargeId) {
    return ctx.reply(MESSAGES.refund_usage);
  }

  try {
    const success = await ctx.telegram.callApi('refundStarPayment', {
      user_id: ctx.from.id,
      telegram_payment_charge_id: chargeId
    });

    if (success) {
      stats.refunds.set(ctx.from.id, (stats.refunds.get(ctx.from.id) || 0 + 1));
      return ctx.reply(MESSAGES.refund_success);
    } else {
      return ctx.reply(MESSAGES.refund_failed);
    }
  } catch (error) {
    console.error('Refund error:', error);
    return ctx.reply(
      `❌ Sorry, there was an error processing your refund:\n` +
      `Error: ${error.message}\n\n` +
      "Please make sure you provided the correct transaction ID and try again."
    );
  }
});

// Stars balance command
bot.command('stars', async (ctx) => {
  try {
    //const star_response = await ctx.telegram.callApi('getMyStarBalance');
    const star_response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMyStarBalance`);
    if (!star_response.ok) throw new Error("server error");
    const response_data = await star_response.json();
    const stars = response_data.result.amount;
    let response = `⭐ *Bot's Telegram Stars Balance*: ${stars} Stars`;
    return ctx.reply(response);
  } catch (error) {
    console.error('Stars command error:', error);
    return ctx.reply("❌ Failed to retrieve Star balance. The Stars API might not be available yet.");
  }
});

// Gifts command
bot.command('gifts', async (ctx) => {
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getAvailableGifts`);
    
    if (!res.ok) {
      throw new Error("Failed to fetch gifts");
    }
    const res_data = await res.json();
    const gifts = res_data.result.gifts;
    const giftsByPrice = {};

    gifts.forEach(gift => {
      const starCount = gift.star_count;
      if (!giftsByPrice[starCount]) {
        giftsByPrice[starCount] = [];
      }
      giftsByPrice[starCount].push(gift);
    });

    let message = "🎁 *Available Telegram Star Gifts*\n\n";
    
    Object.keys(giftsByPrice).sort().forEach(starCount => {
      message += `⭐ *${starCount} Stars*:\n`;
      giftsByPrice[starCount].forEach(gift => {
        const emoji = gift.sticker.emoji;
        message += `- ${emoji} Gift (ID: \`${gift.id}\`)\n`;
      });
      message += "\n";
    });

    message += "\nTo send a gift, use /sendgift [ID] [user]\nExample: `/sendgift 5170145012310081615 @username`";
    
    return ctx.replyWithMarkdown(
      message,
      Markup.inlineKeyboard([
        Markup.button.callback("🎁 View Gift Examples", "view_gift_examples")
      ])
    );
  } catch (error) {
    console.error('Gifts command error:', error);
    return ctx.reply("❌ Couldn't load available gifts. Please try again later.");
  }
});

// Button handler
bot.action(Object.keys(ITEMS), async (ctx) => {
  try {
    const itemId = ctx.match[0];
    const item = ITEMS[itemId];
    
    await ctx.replyWithInvoice({
      chat_id: ctx.chat.id,
      title: item.name,
      description: item.description,
      payload: itemId,
      provider_token: "", // Empty for digital goods
      currency: "XTR", // Telegram Stars currency code
      prices: [{ label: item.name, amount: item.price * 100 }],
      start_parameter: "start_parameter"
    });
  } catch (error) {
    console.error('Button handler error:', error);
    ctx.reply("Sorry, something went wrong while processing your request.");
  }
});

// Pre-checkout handler
bot.on('pre_checkout_query', (ctx) => {
  ctx.answerPreCheckoutQuery(true);
});

// Successful payment handler
bot.on('successful_payment', async (ctx) => {
  const payment = ctx.message.successful_payment;
  const payload = payment.invoice_payload;
  const chargeId = payment.telegram_payment_charge_id;
  
  // Update database
  const client = await connectToDatabase();
  const db = client.db('mahjong_game');
  const paymentCollection = db.collection('payment');
  
  await paymentCollection.updateOne(
    { payload },
    { $set: { status: "Success", charge_id: chargeId } }
  );
  
  await ctx.replyWithMarkdown(
    `Thank you for your purchase! 🎉\n\n` +
    `To get a refund, use this command:\n` +
    `\`/refund ${chargeId}\`\n\n` +
    "Save this message to request a refund later if needed."
  );
});

// Refunded payment
bot.on('refunded_payment', async (ctx) => {
  const refund = ctx.message.refunded_payment;
  const payload = refund.invoice_payload;

  // Update database
  const client = await connectToDatabase();
  const db = client.db('mahjong_game');
  const paymentCollection = db.collection('payment');

  await paymentCollection.updateOne(
    { payload },
    { $set: { status: "Refunded" } }
  );

  await ctx.reply("Refund updated on database");
})

bot.on('StarTransaction')

// Error handler
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}:`, err);
});

// Start bot
bot.launch()
  .then(() => console.log('Bot started'))
  .catch(err => console.error('Error starting bot:', err));

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));