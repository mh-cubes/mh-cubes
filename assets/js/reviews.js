import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import { db } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {

    // =========================================
    // ELEMENTS
    // =========================================

    const nameInput = document.getElementById("review-name");
    const reviewInput = document.getElementById("review-text");
    const ratingInput = document.getElementById("rating");
    const submitButton = document.getElementById("submit-review");
    const reviewList = document.getElementById("reviews-list");
    const toast = document.getElementById("review-toast");

    const stars = document.querySelectorAll(".stars span");

    if (!nameInput || !reviewInput || !ratingInput || !submitButton) {
        console.error("Review elements are missing.");
        return;
    }


    // =========================================
    // PRODUCT NAME
    // =========================================

    const productName = document.title
        .split("-")[0]
        .trim();


    // =========================================
    // STAR RATING
    // =========================================

    stars.forEach((star) => {

        star.addEventListener("click", () => {

            const rating = Number(star.dataset.star);

            if (!rating) return;

            ratingInput.value = rating;

            stars.forEach((s) => {

                const starNumber = Number(s.dataset.star);

                if (starNumber <= rating) {
                    s.textContent = "★";
                    s.classList.add("selected");
                } else {
                    s.textContent = "☆";
                    s.classList.remove("selected");
                }

            });

        });

    });


    // =========================================
    // SUBMIT REVIEW
    // =========================================

    submitButton.addEventListener("click", async () => {

        const name = nameInput.value.trim();
        const review = reviewInput.value.trim();
        const rating = Number(ratingInput.value);


        // NAME VALIDATION

        if (!name) {

            showToast("Please enter your name.");
            nameInput.focus();

            return;
        }


        // REVIEW VALIDATION

        if (!review) {

            showToast("Please write your review.");
            reviewInput.focus();

            return;
        }


        // RATING VALIDATION

        if (rating < 1 || rating > 5) {

            showToast("Please select a star rating.");

            return;
        }


        try {

            submitButton.disabled = true;
            submitButton.textContent = "Submitting...";


            const reviewData = {

                product: productName,

                name: name,

                review: review,

                rating: rating,

                date: new Date().toLocaleDateString(),

                createdAt: Date.now()

            };


            // SAVE REVIEW TO FIRESTORE

            await addDoc(
                collection(db, "reviews"),
                reviewData
            );


            // CLEAR FORM

            nameInput.value = "";
            reviewInput.value = "";
            ratingInput.value = "0";


            // RESET STARS

            stars.forEach((star) => {

                star.textContent = "☆";
                star.classList.remove("selected");

            });


            showToast("Review submitted successfully!");


            // RELOAD REVIEWS

            await displayReviews();


        } catch (error) {

            console.error("FULL REVIEW ERROR:", error);

            showToast(
                "Failed to submit review. Check Firebase rules."
            );

        } finally {

            submitButton.disabled = false;
            submitButton.textContent = "Submit Review";

        }

    });


    // =========================================
    // TOAST
    // =========================================

    function showToast(message) {

        if (!toast) {

            alert(message);

            return;
        }

        toast.textContent = message;

        toast.classList.add("show");


        setTimeout(() => {

            toast.classList.remove("show");

        }, 3000);

    }


    // =========================================
    // LOAD REVIEWS
    // =========================================

    async function displayReviews() {

        if (!reviewList) return;

        reviewList.innerHTML = "<p>Loading reviews...</p>";


        try {

            const reviewsQuery = query(
                collection(db, "reviews"),
                where("product", "==", productName)
            );


            const snapshot = await getDocs(reviewsQuery);


            const reviews = [];


            snapshot.forEach((reviewDoc) => {

                reviews.push({

                    id: reviewDoc.id,

                    ...reviewDoc.data()

                });

            });


            // NEWEST FIRST

            reviews.sort((a, b) => {

                return (
                    (b.createdAt || 0) -
                    (a.createdAt || 0)
                );

            });


            reviewList.innerHTML = "";


            // NO REVIEWS

            if (reviews.length === 0) {

                const noReviews =
                    document.createElement("div");

                noReviews.className = "no-reviews";

                noReviews.innerHTML = `
                    <div class="no-reviews-icon">⭐</div>
                    <h3>No reviews yet</h3>
                    <p>Be the first customer to share your experience!</p>
                `;

                reviewList.appendChild(noReviews);

                return;
            }


            // DISPLAY REVIEWS

            reviews.forEach((item) => {

                const card =
                    document.createElement("div");

                card.className = "review-card";


                // =================================
                // HEADER
                // =================================

                const header =
                    document.createElement("div");

                header.className = "review-header";


                // AVATAR

                const avatar =
                    document.createElement("div");

                avatar.className = "review-avatar";

                avatar.textContent =
                    String(item.name || "?")
                        .charAt(0)
                        .toUpperCase();


                // USER AREA

                const user =
                    document.createElement("div");

                user.className = "review-user";


                const username =
                    document.createElement("h3");

                username.textContent =
                    item.name || "Customer";


                // STARS

                const reviewStars =
                    document.createElement("div");

                reviewStars.className = "review-stars";


                let starsHTML = "";

                for (let i = 1; i <= 5; i++) {

                    if (i <= Number(item.rating)) {

                        starsHTML += "★";

                    } else {

                        starsHTML += "☆";

                    }

                }

                reviewStars.textContent = starsHTML;


                user.appendChild(username);
                user.appendChild(reviewStars);


                // DATE

                const date =
                    document.createElement("span");

                date.className = "review-date";

                date.textContent =
                    item.date || "";


                // =================================
                // ADMIN MENU
                // =================================

                const menuContainer =
                    document.createElement("div");

                menuContainer.className = "review-menu";


                const isAdmin =
                    localStorage.getItem("adminAccess")
                    === "granted";


                if (isAdmin) {

                    const menuButton =
                        document.createElement("button");

                    menuButton.className =
                        "review-menu-btn";

                    menuButton.type = "button";

                    menuButton.textContent = "⋮";


                    const menu =
                        document.createElement("div");

                    menu.className =
                        "review-menu-dropdown";


                    const deleteButton =
                        document.createElement("button");

                    deleteButton.className =
                        "delete-review-btn";

                    deleteButton.type = "button";

                    deleteButton.textContent =
                        "Delete Review";


                    menu.appendChild(deleteButton);

                    menuContainer.appendChild(menuButton);
                    menuContainer.appendChild(menu);


                    // OPEN MENU

                    menuButton.addEventListener(
                        "click",
                        (event) => {

                            event.stopPropagation();

                            document
                                .querySelectorAll(
                                    ".review-menu-dropdown"
                                )
                                .forEach((otherMenu) => {

                                    if (otherMenu !== menu) {

                                        otherMenu.classList.remove(
                                            "show"
                                        );

                                    }

                                });

                            menu.classList.toggle("show");

                        }
                    );


                    // DELETE REVIEW

                    deleteButton.addEventListener(
                        "click",
                        async (event) => {

                            event.stopPropagation();


                            const confirmed =
                                confirm(
                                    "Are you sure you want to delete this review?"
                                );


                            if (!confirmed) {

                                menu.classList.remove("show");

                                return;
                            }


                            try {

                                await deleteDoc(
                                    doc(
                                        db,
                                        "reviews",
                                        item.id
                                    )
                                );


                                menu.classList.remove("show");

                                showToast(
                                    "Review deleted successfully."
                                );


                                await displayReviews();


                            } catch (error) {

                                console.error(
                                    "Delete review error:",
                                    error
                                );


                                showToast(
                                    "Failed to delete review."
                                );

                            }

                        }
                    );

                }


                // =================================
                // HEADER
                // =================================

                header.appendChild(avatar);
                header.appendChild(user);
                header.appendChild(date);
                header.appendChild(menuContainer);


                // =================================
                // REVIEW MESSAGE
                // =================================

                const message =
                    document.createElement("p");

                message.className =
                    "review-message";

                message.textContent =
                    item.review || "";


                // =================================
                // ADD TO CARD
                // =================================

                card.appendChild(header);

                card.appendChild(message);


                reviewList.appendChild(card);

            });


        } catch (error) {

            console.error(
                "Error loading reviews:",
                error
            );


            reviewList.innerHTML =
                "<p>Unable to load reviews.</p>";

        }

    }


    // =========================================
    // CLOSE ADMIN MENUS
    // =========================================

    document.addEventListener("click", () => {

        document
            .querySelectorAll(".review-menu-dropdown")
            .forEach((menu) => {

                menu.classList.remove("show");

            });

    });


    // =========================================
    // START
    // =========================================

    displayReviews();

});
