# Gami - Gamified Rewards Platform

Transform your daily activities into rewarding adventures with Gami, a revolutionary mobile app that combines gamification with blockchain technology to reward real-world actions.

## 🎮 What is Gami?

Gami is a cross-platform mobile application built with React Native and Expo that turns everyday activities into exciting quests. Users earn XP, level up, and receive real rewards including cash, gift cards, and cryptocurrency tokens for completing fitness challenges, exploring local businesses, and staying productive.

## ✨ Key Features

### 🎯 Quest System
- **Daily Challenges**: Fitness, productivity, and local exploration quests
- **Real Rewards**: Earn cash, gift cards, and cryptocurrency
- **Progressive Difficulty**: Quests scale with your level and experience
- **Sponsored Content**: Partner with local businesses and brands

### 🏆 Gamification
- **XP & Leveling**: Gain experience points and level up your profile
- **Global Leaderboards**: Compete with players worldwide
- **Achievement System**: Unlock badges and titles for milestones
- **Streak Tracking**: Maintain daily activity streaks for bonus rewards

### ⛓️ Blockchain Integration
- **Internet Computer Protocol (ICP)**: Secure, decentralized reward storage
- **True Ownership**: Your tokens are stored on-chain and truly owned by you
- **Cross-Platform**: Access your rewards across any device or platform
- **Multiple Tokens**: GAMI, QUEST, LOCAL, FIT, and PROD reward tokens

### 🌍 Local Discovery
- **Business Partnerships**: Discover and support local businesses
- **Location-Based Quests**: Explore your neighborhood and earn rewards
- **Community Building**: Connect with other players in your area

## 🛠️ Technology Stack

### Frontend
- **React Native** - Cross-platform mobile development
- **Expo Router** - File-based navigation system
- **TypeScript** - Type-safe development
- **Expo SDK 53** - Latest Expo features and APIs

### Blockchain
- **Internet Computer Protocol (ICP)** - Decentralized backend
- **Motoko** - Smart contract programming language
- **Internet Identity** - Secure, passwordless authentication
- **Candid** - Interface description language

### Backend Services
- **Multiple Canisters**: Modular smart contract architecture
  - `gami_backend` - Core application logic
  - `user_profiles` - User management and achievements
  - `quest_rewards` - Token distribution and rewards
  - `leaderboard` - Global rankings and statistics
  - `token_ledger` - Blockchain token management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI
- DFX (for blockchain development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/gami-app.git
   cd gami-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Run on your device**
   - Install Expo Go app on your mobile device
   - Scan the QR code displayed in the terminal
   - Or run in web browser at `http://localhost:8081`

### Blockchain Development (Optional)

To work with the blockchain components:

1. **Install DFX**
   ```bash
   sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
   ```

2. **Start local Internet Computer**
   ```bash
   dfx start --background
   ```

3. **Deploy canisters**
   ```bash
   dfx deploy
   ```

## 📱 App Structure

```
app/
├── (auth)/              # Authentication flow
│   ├── splash.tsx       # Welcome screen
│   ├── tutorial.tsx     # Onboarding tutorial
│   ├── login.tsx        # User login
│   └── signup.tsx       # User registration
├── (tabs)/              # Main app navigation
│   ├── index.tsx        # Home dashboard
│   ├── quests.tsx       # Quest browsing and completion
│   ├── leaderboard.tsx  # Global rankings
│   └── profile.tsx      # User profile and settings
└── _layout.tsx          # Root navigation layout

components/
├── BlockchainIntegration.tsx  # Wallet connection UI
└── MCPIntegration.tsx         # AI agent connections

contexts/
└── BlockchainContext.tsx      # Blockchain state management

services/
└── icpService.ts             # Internet Computer integration

src/                          # Motoko smart contracts
├── gami_backend/
├── user_profiles/
├── quest_rewards/
├── leaderboard/
└── token_ledger/
```

## 🎯 Core Concepts

### Quest Categories
- **Fitness**: Workout challenges, step goals, activity tracking
- **Productivity**: Focus sessions, task completion, habit building
- **Local**: Business visits, community engagement, exploration
- **Social**: Team challenges, friend competitions, group activities

### Reward Tokens
- **GAMI**: Primary platform token for general activities
- **QUEST**: Earned from completing specific quest types
- **LOCAL**: Rewards for local business engagement
- **FIT**: Fitness and health-related activities
- **PROD**: Productivity and work-focused tasks

### User Progression
- **XP System**: Gain experience points from all activities
- **Level Progression**: Unlock new features and higher-value quests
- **Achievement Badges**: Milestone rewards for consistent engagement
- **Global Rankings**: Compete on worldwide leaderboards

## 🔧 Development

### Available Scripts
- `npm run dev` - Start Expo development server
- `npm run build:web` - Build for web deployment
- `npm run lint` - Run ESLint code analysis
- `dfx start` - Start local Internet Computer network
- `dfx deploy` - Deploy smart contracts

### Environment Setup
The app uses Expo's environment system. Create a `.env` file for local development:

```env
EXPO_PUBLIC_API_URL=your_api_url
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Modular component architecture

## 🌐 Deployment

### Mobile Deployment
1. **Build for production**
   ```bash
   expo build:android
   expo build:ios
   ```

2. **Submit to app stores**
   ```bash
   expo submit:android
   expo submit:ios
   ```

### Web Deployment
1. **Build web version**
   ```bash
   npm run build:web
   ```

2. **Deploy to hosting platform**
   - Netlify, Vercel, or any static hosting service

### Blockchain Deployment
1. **Deploy to IC mainnet**
   ```bash
   dfx deploy --network ic
   ```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation for API changes
- Ensure mobile responsiveness
- Test on both iOS and Android

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Internet Computer Foundation** - For the decentralized infrastructure
- **Expo Team** - For the excellent React Native framework
- **Community Contributors** - For feedback and feature suggestions
- **Local Business Partners** - For supporting the reward ecosystem

## 📞 Support

- **Email**: support@gami.app
- **Discord**: [Join our community](https://discord.gg/gami)
- **Documentation**: [docs.gami.app](https://docs.gami.app)
- **Bug Reports**: [GitHub Issues](https://github.com/yourusername/gami-app/issues)

## 🔮 Roadmap

### Q1 2025
- [ ] iOS and Android app store launch
- [ ] Enhanced AI quest recommendations
- [ ] Social features and friend systems
- [ ] Advanced analytics dashboard

### Q2 2025
- [ ] NFT achievement system
- [ ] Cross-chain token support
- [ ] Enterprise partnership program
- [ ] Advanced location-based features

### Q3 2025
- [ ] AR quest experiences
- [ ] Wearable device integration
- [ ] Advanced DeFi features
- [ ] Global expansion

---

**Made with ❤️ by the Gami Team**

*Turning everyday life into an adventure, one quest at a time.*