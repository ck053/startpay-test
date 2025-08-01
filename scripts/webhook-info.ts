import * as dotenv from 'dotenv'

dotenv.config({ path: '.env' })

const BOT_TOKEN = process.env.BOT_TOKEN

if (!BOT_TOKEN) {
    console.error('❌ Missing TELEGRAM_BOT_TOKEN in .env.local')
    process.exit(1)
}

async function getWebhookInfo() {
    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`)
        const data = await response.json()

        console.log('📊 Webhook Information:')
        console.log('====================')

        if (data.result.url) {
            console.log(`✅ URL: ${data.result.url}`)
            console.log(`📈 Pending updates: ${data.result.pending_update_count || 0}`)

            if (data.result.last_error_date) {
                const errorDate = new Date(data.result.last_error_date * 1000)
                console.log(`❌ Last error: ${data.result.last_error_message}`)
                console.log(`📅 Error date: ${errorDate.toLocaleString()}`)
            } else {
                console.log(`✅ No recent errors`)
            }

            if (data.result.max_connections) {
                console.log(`🔗 Max connections: ${data.result.max_connections}`)
            }
        } else {
            console.log('❌ No webhook set')
        }
    } catch (error) {
        console.error('Error fetching webhook info:', error)
    }
}

getWebhookInfo()