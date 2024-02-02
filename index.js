const express = require('express')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const port = process.env.PORT || 3000
const app = express()

app.get("/", (req, res) => {
    return res.send(`<h1>Hello!</h1>
    <a href="./auth">Logga in med Github</a>`)
});
app.get("/auth", (req,res)=> {
    const params = {
        scope: "read:user",
        client_id: process.env.CLIENT_ID
    }

    const urlParams = new URLSearchParams(params).toString();

    res.redirect(`https://github.com/login/oauth/authorize?${urlParams}`)
})


app.get("/github-callback",async (req,res)=> {
const body = {
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    code: req.query.code
}

const response = await fetch("https://github.com/login/oauth/access_token", {
    method: `POST`,
    headers: {'Content-Type': 'application/json',
    'Accept': 'application/json'},
    body: JSON.stringify(body)
})
const data = await response.json()
console.log(data)

});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
});