# MONGO REST SERVER

A secured rest server with mongodb to store data.

### Setup Server

```bash
git clone git@github.com:rajpaswan/mongo-rest-server.git
cd mongo-rest-server
npm install
```

### Configure Server

Edit `.env` file to manager your enviroment configuration.  

```bash
# db settings
DB_HOST=localhost
DB_PORT=27017

# app settings
APP_PORT=3000
APP_SECRET=superSecret
```

### Start Server

```bash
npm start
```

### User Registration

POST `http://localhost:3000/api/register`
```json
{
    "email": "user@company.com",
    "password": "********"
}
```

### User Authentication

POST `http://localhost:3000/api/authenticate`
```json
{
    "email": "user@company.com",
    "password": "********"
}
```
It responds with a token. Copy the token.

### Data Requests

Set header `x-access-token`=`{token recieved at authenticate}`  

GET `http://localhost:3000/data/`