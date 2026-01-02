# WPayz Payment Gateway

Thai payment gateway integration for WPayz provider.

## Features

- QR Code Deposit
- Bank Account Withdrawal
- Callback handling
- Transaction status checking

## Environment Variables

```env
NODE_ENV=development
PORT=3000
API_HOST=https://wpayz-api.example.com
MONGODB_URI=mongodb://localhost:27017/wpayz
```

## Development

```bash
npm install
npm run start:dev
```

## Build

```bash
npm run build
```

## Test

```bash
npm test
```

## Docker

```bash
docker build -t wpayz .
docker run -p 3000:3000 wpayz
```
