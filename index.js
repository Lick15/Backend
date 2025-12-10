const express = require("express");
const fs = require("fs");
const app = express();
const port = process.env.PORT || 3000;

// หน้าแรก → redirect ไป lootlabs
app.get("/", (req, res) => {
    res.redirect("https://lootlabs.gg/generate?task=YOUR_TASK_ID");
});

// lootlabs ทำเสร็จ → redirect มา /get → ส่งสคริปต์
app.get("/get", (req, res) => {
    const script = fs.readFileSync("./script.lua", "utf8");
    res.type("text/plain").send(script);
});

app.listen(port, () => console.log("Server running on port " + port));
