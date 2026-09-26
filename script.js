// ========================================
// MOBILE NAVIGATION
// ========================================

const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", function () {
        navLinks.classList.toggle("active");
    });
}

// Close menu after clicking a navigation link

const navigationLinks =
    document.querySelectorAll(".nav-links a");

navigationLinks.forEach(function (link) {
    link.addEventListener("click", function () {
        navLinks.classList.remove("active");
    });
});


// ========================================
// CURRENT YEAR
// ========================================

const year = document.getElementById("year");

if (year) {
    year.textContent = new Date().getFullYear();
}


// ========================================
// CONTACT FORM
// ========================================

const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

if (contactForm) {

    contactForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const name =
            document.getElementById("name").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const message =
            document.getElementById("message").value.trim();


        // Basic validation

        if (name.length < 2) {
            formStatus.textContent =
                "Please enter your name.";
            return;
        }

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            formStatus.textContent =
                "Please enter a valid email address.";
            return;
        }

        if (message.length < 10) {
            formStatus.textContent =
                "Message must contain at least 10 characters.";
            return;
        }


        // Send message to backend

        try {

            formStatus.textContent =
                "Sending message...";

            const response = await fetch("/api/contact", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name,
                    email: email,
                    message: message
                })

            });


            const result = await response.json();


            if (result.success) {

                formStatus.textContent =
                    "Message sent successfully!";

                formStatus.style.color =
                    "#067647";

                contactForm.reset();

            } else {

                formStatus.textContent =
                    result.message;

                formStatus.style.color =
                    "red";

            }

        } catch (error) {

            console.error("Error:", error);

            formStatus.textContent =
                "Unable to send message.";

            formStatus.style.color =
                "red";
        }

    });

}