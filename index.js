const express = require('express')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const port = process.env.PORT || 3000
const app = express()

app.get("/", (req, res) => {

    if (!req.query.token) {
        return res.send(`
            <h1>Hello!</h1>
            <a href="./auth">Logga in med GitHub</a>
        `)
    }

    try {

        const user = jwt.verify(req.query.token, process.env.JWT_SECRET)

        res.send(`
            <h1>Welcome ${user.name}!</h1>
        `)

    } catch (err) {
        return res.send("Authorization failed!")
    }

});

app.get("/auth", (req, res) => {
    const params =  {
        scope: "read:user",
        client_id: process.env.CLIENT_ID
    }

    const urlParams = new URLSearchParams(params).toString()

    res.redirect(`https://github.com/login/oauth/authorize?${urlParams}`)

});

app.get("/github-callback", async (req, res) => {
    const body = {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code: req.query.code
    }

    const response = await fetch("https://github.com/login/oauth/access_token", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(body)
    })

    const data = await response.json()
    console.log(data)

    const respUser = await fetch("https://api.github.com/user", {
        headers: { 'Authorization': `Bearer ${data.access_token}`}
    })

    const userData = await respUser.json()

    console.log(userData)

    const localToken = jwt.sign({
        sub: userData.id,
        username: userData.login,
        name: userData.name
    }, process.env.JWT_SECRET, { expiresIn: '1h' })

    res.redirect(`/?token=${localToken}`)

});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
});