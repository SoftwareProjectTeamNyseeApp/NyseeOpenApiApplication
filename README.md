
# NYSSE Open API Application

Nysse Open Api App is an app that ultilize the Nysse Open API, in order to provide the user in Tampere arena, a rapidly expanding city, with real-time traffic and transportation information.  
Using information from the Nysee Open API, a platform for public transportation and traffic data, the program offers real-time updates on transit options, delays, and the best routes. This program aims to improve urban mobility and meet the needs of residents and tourists about smart city solutions.

## API Reference
#### Nysse OpenAPI
https://digitransit.fi/en/developers/

## Authors

- [@Juska Karo Kellokumpu](https://github.com/jkellok)
- [@Le Hoang Long](https://github.com/LongleKuro2106)
- [@Nguyen Truong Minh Kiet](https://github.com/JerryPlayzGames)

## How to use
Required: Visual Studio Code, Android Studio or Expo Go, Digitransit API registration

1. Install Expo GO (SDK 51) on your phone (preferably Android) or alternatively use Android Studio to simulate Android phone (https://docs.expo.dev/workflow/android-studio-emulator/)
2. Git clone this repository
3. In .env file, add API_NAME and API_KEY after registering to digitransit here: https://portal-api.digitransit.fi/ 
4. In Visual Studio Code terminal, move to app folder "cd app" and start app with "npm start"
5. Scan QR code with your phone (make sure you're using the same network on your computer and phone) or use Android Studio

## Known bugs
- Visual bug: origin and destination fields are not updated when the values are switched
