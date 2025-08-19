# Telegram Miniapp Mahjong Game
A single-player Mahjong game where you compete against three AI opponents. Play using Telegram Stars and win exciting rewards!
## Installation
### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (local or cloud)
- Telegram Bot ([@BotFather](https://t.me/BotFather))
### Dependencies
Install the required dependencies:  
`npm install`
## Configuration
Create a .env file in your project root with the following variables:
DIFFICULTY=3       # Game difficulty (1 = Easy, 2 = Medium, 3 = Hard)  
MONGODB_URI=       # Your MongoDB connection URI  
BOT_TOKEN=         # Your Telegram Bot token  
NEXT_PUBLIC_APP_URL= # Public URL for the webhook (e.g., your server's domain)
## Usage
### Setting Up the Bot
Configure the Telegram bot webhook:  
`npm run bot:setup`
### Running the Application
Build and start the server:  
`npm run start`
## features
- 🎮 Single-player Mahjong against AI opponents
- ⚡ Play using Telegram Stars
- 🎁 Win rewards and gifts
- 🏆 Adjustable difficulty levels
