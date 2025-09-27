# 🎁 Coin Gift - Crypto Escrow Gift Application

Send crypto gifts to friends and family using shareable secret codes. Recipients don't need wallets - just enter the code to claim their gift.

## 🎯 How it Works

1. **Create Gift**: Send ETH to escrow, get a secret code
2. **Share**: Send the code/QR/link to recipient  
3. **Claim**: Recipient enters code + their wallet address to receive ETH

**Stack**: React + Hono + Cloudflare (Workers/Pages/D1)  
**Network**: Base (low fees)  
**Limits**: $1-$1000 for POC

## 🔄 Detailed Application Flow

```mermaid
sequenceDiagram
    participant A as Party A (Sender)
    participant App as Web App
    participant DB as Database
    participant Wallet as Escrow Wallet
    participant B as Party B (Recipient)
    participant Email as Email Service

    A->>App: Create escrow ($X ETH)
    App->>App: Generate high-entropy secret
    App->>DB: Store escrow (secret hash, amount, expiration, pending)
    A->>Wallet: Send ETH to escrow wallet address
    Wallet->>App: Confirm ETH received (webhook/polling)
    App->>DB: Update escrow status to active
    App->>A: Display secret (raw + QR + URL)
    App->>Email: Send creation confirmation (optional)
    
    Note over A,B: Party A shares secret via secure channel
    
    B->>App: Enter secret code + recipient wallet address
    App->>DB: Verify secret hash & check expiration
    App->>Wallet: Initiate ETH transfer to recipient
    Wallet->>B: Transfer ETH directly to recipient wallet
    Wallet->>App: Confirm transfer completed
    App->>DB: Mark escrow as completed
    App->>Email: Send redemption confirmation (optional)

    Note over A,Wallet: Cancellation/Recovery Flow
    alt After 5 minutes (wrong amount) or expiration
        A->>App: Request cancellation with secret
        App->>DB: Verify ownership & timing rules
        App->>Wallet: Initiate ETH return to sender
        Wallet->>A: Transfer ETH directly to sender wallet
        Wallet->>App: Confirm return completed
        App->>DB: Mark escrow as cancelled
        App->>Email: Send cancellation confirmation (optional)
    end
```


## ✨ Features

- 🔐 Secure escrow with secret codes
- 📱 QR codes and mobile-friendly
- ⏰ 30-day expiration (sender recoverable)
- 🚀 No wallet needed for recipients

## 🏗️ Tech Stack

**Monorepo Structure:**
- `client/` - React + TypeScript + Vite 
- `server/` - Hono API on Cloudflare Workers
- `shared/` - Common types and utilities

**Infrastructure:**
- Frontend: Cloudflare Pages
- Backend: Cloudflare Workers  
- Database: Cloudflare D1 (SQLite)
- Package Manager: Bun

**Why Cloudflare:** Simple, cheap (free tier), single platform for everything.

## 🚀 Development Plan

**Phase 1: MVP**
- [ ] Monorepo setup with Bun
- [ ] Hono API + D1 database  
- [ ] React frontend with routing
- [ ] Secret generation + QR codes
- [ ] Create/redeem flow
- [ ] MetaMask integration
- [ ] Deploy to Cloudflare

**Phase 2: Smart Contracts (Maybe)**
- [ ] Move escrow logic on-chain
- [ ] Trustless operation

## 🔒 Security Notes

- High-entropy secrets (32+ chars)
- Secrets hashed in database
- Rate limiting on API
- 30-day expiration with recovery
- HTTPS everywhere