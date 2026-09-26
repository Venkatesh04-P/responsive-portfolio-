const express = require("express");
const fs = require("fs");
const path = require("path");
const session = require("express-session");

const app = express();
const PORT = 3000;


// ========================================
// FILE PATH
// ========================================

const messagesFile = path.join(__dirname, "messages.json");


// ========================================
// MIDDLEWARE
// ========================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ========================================
// SESSION
// ========================================

app.use(
    session({
        secret: "venkatesh-portfolio-secret-key",
        resave: false,
        saveUninitialized: false,

        cookie: {
            httpOnly: true,
            maxAge: 1000 * 60 * 60
        }
    })
);


// ========================================
// ADMIN AUTHENTICATION MIDDLEWARE
// ========================================

function requireAdmin(req, res, next) {

    if (req.session && req.session.isAdmin === true) {

        next();

    } else {

        res.redirect("/login.html");

    }

}


// ========================================
// LOGIN PAGE
// ========================================

app.get("/login.html", (req, res) => {

    res.sendFile(
        path.join(__dirname, "login.html")
    );

});


// ========================================
// ADMIN PAGE - PROTECTED
// ========================================

app.get("/admin.html", requireAdmin, (req, res) => {

    res.sendFile(
        path.join(__dirname, "admin.html")
    );

});


// ========================================
// OTHER WEBSITE FILES
// ========================================

app.use(express.static(__dirname));


// ========================================
// ADMIN LOGIN API
// ========================================

app.post("/api/login", (req, res) => {

    const { username, password } = req.body;


    // Demo admin credentials

    const ADMIN_USERNAME = "admin";
    const ADMIN_PASSWORD = "admin123";


    if (
        username === ADMIN_USERNAME &&
        password === ADMIN_PASSWORD
    ) {

        req.session.isAdmin = true;

        console.log("Admin logged in");


        return res.json({

            success: true,

            message: "Login successful"

        });

    }


    console.log("Invalid login attempt");


    res.status(401).json({

        success: false,

        message: "Invalid username or password"

    });

});


// ========================================
// CHECK LOGIN STATUS
// ========================================

app.get("/api/check-login", (req, res) => {

    if (
        req.session &&
        req.session.isAdmin === true
    ) {

        return res.json({

            loggedIn: true

        });

    }


    res.json({

        loggedIn: false

    });

});


// ========================================
// LOGOUT
// ========================================

app.post("/api/logout", (req, res) => {

    req.session.destroy((error) => {

        if (error) {

            return res.status(500).json({

                success: false,

                message: "Logout failed"

            });

        }


        res.json({

            success: true,

            message: "Logged out successfully"

        });

    });

});


// ========================================
// CONTACT FORM API
// ========================================

app.post("/api/contact", (req, res) => {

    console.log("Contact request received");


    const {
        name,
        email,
        message
    } = req.body;


    // Validate fields

    if (
        !name ||
        !email ||
        !message
    ) {

        return res.status(400).json({

            success: false,

            message: "Please fill all fields."

        });

    }


    let messages = [];


    // Read existing messages

    try {

        if (fs.existsSync(messagesFile)) {

            const data =
                fs.readFileSync(
                    messagesFile,
                    "utf8"
                );


            if (data.trim() !== "") {

                messages =
                    JSON.parse(data);

            }

        }

    } catch (error) {

        console.error(
            "Error reading messages:",
            error
        );

        messages = [];

    }


    // Create new message

    const newMessage = {

        id: Date.now(),

        name: name,

        email: email,

        message: message,

        date: new Date().toLocaleString()

    };


    // Add message

    messages.push(newMessage);


    // Save messages

    try {

        fs.writeFileSync(

            messagesFile,

            JSON.stringify(
                messages,
                null,
                2
            )

        );


        console.log(
            "Message saved successfully"
        );


    } catch (error) {

        console.error(
            "Error saving message:",
            error
        );


        return res.status(500).json({

            success: false,

            message: "Unable to save message."

        });

    }


    res.json({

        success: true,

        message: "Message sent successfully!"

    });

});


// ========================================
// GET ALL MESSAGES
// ADMIN ONLY
// ========================================

app.get(
    "/api/messages",
    requireAdmin,
    (req, res) => {

        try {

            if (
                !fs.existsSync(
                    messagesFile
                )
            ) {

                return res.json([]);

            }


            const data =
                fs.readFileSync(
                    messagesFile,
                    "utf8"
                );


            const messages =
                data.trim()
                    ? JSON.parse(data)
                    : [];


            console.log(
                "Messages found:",
                messages.length
            );


            res.json(messages);


        } catch (error) {

            console.error(
                "Error reading messages:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to load messages."

            });

        }

    }
);


// ========================================
// DELETE MESSAGE
// ADMIN ONLY
// ========================================

app.delete(
    "/api/messages/:id",
    requireAdmin,
    (req, res) => {

        const messageId =
            Number(req.params.id);


        try {

            if (
                !fs.existsSync(
                    messagesFile
                )
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Messages file not found."

                });

            }


            const data =
                fs.readFileSync(
                    messagesFile,
                    "utf8"
                );


            let messages =
                data.trim()
                    ? JSON.parse(data)
                    : [];


            const oldLength =
                messages.length;


            messages =
                messages.filter(
                    message =>
                        message.id !== messageId
                );


            if (
                messages.length === oldLength
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Message not found."

                });

            }


            fs.writeFileSync(

                messagesFile,

                JSON.stringify(
                    messages,
                    null,
                    2
                )

            );


            console.log(
                "Message deleted:",
                messageId
            );


            res.json({

                success: true,

                message:
                    "Message deleted successfully."

            });


        } catch (error) {

            console.error(
                "Error deleting message:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to delete message."

            });

        }

    }
);


// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {

    console.log("");
    console.log("================================");
    console.log("      PORTFOLIO SERVER");
    console.log("================================");
    console.log(
        `Server: http://localhost:${PORT}`
    );
    console.log(
        `Login:  http://localhost:${PORT}/login.html`
    );
    console.log("================================");
    console.log("");

});