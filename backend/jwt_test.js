import jwt from 'jsonwebtoken';

const accessToken = jwt.sign(
    { username: "username"},
    "secret",
    { expiresIn: "15m" }
);

const verified = jwt.verify(accessToken, "secret");

console.log(verified)
