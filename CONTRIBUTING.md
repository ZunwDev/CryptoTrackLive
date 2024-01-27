## 🔨 Contributing

If you really want to contribute, I'm open for any contributions. Just be **aware**, the API that I use is really limited, since I can't afford any better like [CoinGecko](https://www.coingecko.com/en/api)

### How to run the application on your local device

1. Create a fork of this app
2. Import it to your code editor
3. When you are in the CryptoTrack folder, do `npm install`
4. Go to [LWC](https://www.livecoinwatch.com/tools/api) and [CoinStats](https://openapi.coinstats.app) get your API key
5. Create an .env file, and insert here `VITE_API_KEY=your lwc key` and `VITE_CS_API_KEY=your coin stats key`
6. Run `npm run dev`

!Don't put your API key into public!

### To contribute do

1. Before contributing run `npm run build` to check if everything is fine and get latest version of the app
2. If the build output has no errors, you are ready to make a pull request
