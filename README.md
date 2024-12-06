
# NYSSE Open API Application

Nysse Open Api App is an app that ultilize the Nysse Open API, in order to provide the user in Tampere arena, a rapidly expanding city, with real-time traffic and transportation information.  
Using information from the Nysee Open API, a platform for public transportation and traffic data, the program offers real-time updates on transit options, delays, and the best routes. This program aims to improve urban mobility and meet the needs of residents and tourists about smart city solutions.

## API Reference
#### Nysse OpenAPI
https://digitransit.fi/en/developers/

#### Get all items

```http
  GET /api/items
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `api_key` | `string` | **Required**. Your API key |

#### Get item

```http
  GET /api/items/${id}
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `string` | **Required**. Id of item to fetch |


## Authors

- [@Juska Karo Kellokumpu](https://github.com/jkellok)
- [@Le Hoang Long](https://github.com/LongleKuro2106)
- [@Nguyen Truong Minh Kiet](https://github.com/JerryPlayzGames)



