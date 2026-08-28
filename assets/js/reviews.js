
import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import { db, auth } from "./firebase.js";


document.addEventListener("DOMContentLoaded", () => {

    const nameInput = document.getElementById("review-name");
    const reviewInput = document.getElementById("review-text");
    const ratingInput = document.getElementById("rating");
    const submitButton = document.getElementById("submit-review");
    const reviewList = document.getElementById("reviews-list");
    const toast = document.getElementById("review-toast");

    const stars = document.querySelectorAll(".stars span");


    if (!nameInput || !reviewInput || !ratingInput || !submitButton) {
        console.error("Review elements missing.");
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

                const number = Number(s.dataset.star);

                if (number <= rating) {

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

        const currentUser = auth.currentUser;

        if (!currentUser) {

            showToast("Please login before submitting a review.");

            return;
        }


        const name = nameInput.value.trim();
        const review = reviewInput.value.trim();
        const rating = Number(ratingInput.value);


        if (!name) {

            showToast("Please enter your name.");
            nameInput.focus();

            return;
        }


        if (!review) {

            showToast("Please write your review.");
            reviewInput.focus();

            return;
        }


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

                customerUID: currentUser.uid,

                date: new Date().toLocaleDateString(),

                createdAt: Date.now()

            };


            await addDoc(
                collection(db, "reviews"),
                reviewData
            );


            nameInput.value = "";
            reviewInput.value = "";

            ratingInput.value = "0";


            stars.forEach((star) => {

                star.textContent = "☆";
                star.classList.remove("selected");

            });


            showToast("Review submitted successfully!");


            await displayReviews();


        } catch (error) {

            console.error("Submit review error:", error);

            showToast("Failed to submit review.");

        } finally {

            submitButton.disabled = false;
            submitButton.textContent = "Submit Review";

        }

    });


    // =========================================
    // DISPLAY REVIEWS
    // =========================================

    async function displayReviews() {

        if (!reviewList) return;


        reviewList.innerHTML = `
            <div class="reviews-loading">
                Loading reviews...
            </div>
        `;


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


            reviews.sort((a, b) => {

                return (
                    (b.createdAt || 0) -
                    (a.createdAt || 0)
                );

            });


            reviewList.innerHTML = "";


            if (reviews.length === 0) {

                reviewList.innerHTML = `
                    <div class="no-reviews">
                        <div class="no-reviews-icon">⭐</div>

                        <h3>No reviews yet</h3>

                        <p>
                            Be the first customer to share your experience!
                        </p>
                    </div>
                `;

                return;
            }


            const currentUser = auth.currentUser;

            const ownerUID =
                "UPdmuwyLEcdEyMxFENPGRlAhxwa2";


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

                reviewStars.className =
                    "review-stars";


                for (let i = 1; i <= 5; i++) {

                    reviewStars.textContent +=
                        i <= Number(item.rating)
                            ? "★"
                            : "☆";

                }


                user.appendChild(username);
                user.appendChild(reviewStars);


                // DATE

                const date =
                    document.createElement("span");

                date.className =
                    "review-date";

                date.textContent =
                    item.date || "";


                // =================================
                // DELETE BUTTON
                // =================================

                const menuContainer =
                    document.createElement("div");

                menuContainer.className =
                    "review-menu";


                const isOwner =
                    currentUser &&
                    currentUser.uid === ownerUID;


                const isReviewOwner =
                    currentUser &&
                    item.customerUID === currentUser.uid;


                if (isOwner || isReviewOwner) {

                    const deleteButton =
                        document.createElement("button");

                    deleteButton.type = "button";

                    deleteButton.className =
                        "delete-review-btn";

                    deleteButton.textContent =
                        "🗑️";


                    deleteButton.title =
                        "Delete review";


                    deleteButton.addEventListener(
                        "click",
                        async () => {

                            const confirmed =
                                confirm(
                                    "Are you sure you want to delete this review?"
                                );


                            if (!confirmed) return;


                            try {

                                deleteButton.disabled = true;

                                await deleteDoc(
                                    doc(
                                        db,
                                        "reviews",
                                        item.id
                                    )
                                );


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


                                deleteButton.disabled = false;

                            }

                        }
                    );


                    menuContainer.appendChild(
                        deleteButton
                    );

                }


                // HEADER

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
                // CARD
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


            reviewList.innerHTML = `
                <div class="no-reviews">
                    <h3>Unable to load reviews</h3>
                    <p>Please try again later.</p>
                </div>
            `;

        }

    }


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
    // AUTH STATE
    // =========================================

    onAuthStateChanged(auth, () => {

        displayReviews();

    });

});

