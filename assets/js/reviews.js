document.addEventListener("DOMContentLoaded", () => {

    const stars = document.querySelectorAll(".stars span");
    const ratingInput = document.getElementById("rating");
    const submitButton = document.getElementById("submit-review");
    const reviewName = document.getElementById("review-name");
    const reviewText = document.getElementById("review-text");
    const reviewImages = document.getElementById("review-images");
    const imagePreview = document.getElementById("image-preview");
    const reviewList = document.getElementById("reviews-list");
    const toast = document.getElementById("review-toast");

    let selectedImages = [];

    /* =========================
       STAR RATING
    ========================= */

    stars.forEach(star => {

        star.addEventListener("click", () => {

            const rating = Number(star.dataset.star);

            ratingInput.value = rating;

            stars.forEach(s => {

                const starNumber = Number(s.dataset.star);

                if (starNumber <= rating) {
                    s.innerText = "★";
                    s.classList.add("selected");
                } else {
                    s.innerText = "☆";
                    s.classList.remove("selected");
                }

            });

        });

        /* Hover effect */

        star.addEventListener("mouseenter", () => {

            const rating = Number(star.dataset.star);

            stars.forEach(s => {

                if (Number(s.dataset.star) <= rating) {
                    s.innerText = "★";
                } else {
                    s.innerText = "☆";
                }

            });

        });

    });


    /* Restore selected rating after mouse leaves */

    document.querySelector(".stars")?.addEventListener("mouseleave", () => {

        const rating = Number(ratingInput.value);

        stars.forEach(s => {

            if (Number(s.dataset.star) <= rating) {
                s.innerText = "★";
            } else {
                s.innerText = "☆";
            }

        });

    });


    /* =========================
       IMAGE UPLOAD PREVIEW
    ========================= */

    if (reviewImages) {

        reviewImages.addEventListener("change", () => {

            selectedImages = [];

            imagePreview.innerHTML = "";

            const files = Array.from(reviewImages.files);

            files.forEach(file => {

                if (!file.type.startsWith("image/")) {
                    return;
                }

                const reader = new FileReader();

                reader.onload = function(event) {

                    selectedImages.push(event.target.result);

                    const img = document.createElement("img");

                    img.src = event.target.result;

                    img.className = "review-preview-image";

                    imagePreview.appendChild(img);

                };

                reader.readAsDataURL(file);

            });

        });

    }


    /* =========================
       SUBMIT REVIEW
    ========================= */

    if (submitButton) {

        submitButton.addEventListener("click", () => {

            const name = reviewName.value.trim();

            const review = reviewText.value.trim();

            const rating = Number(ratingInput.value);


            /* Validation */

            if (name === "" || review === "") {

                showToast("⚠️ Please fill your name and review.");

                return;

            }


            if (rating === 0) {

                showToast("⭐ Please select a star rating.");

                return;

            }


            /* Load existing reviews */

            let reviews =
                JSON.parse(localStorage.getItem("reviews")) || [];


            /* Create review */

            const newReview = {

                id: Date.now(),

                name: name,

                review: review,

                rating: rating,

                images: selectedImages,

                date: new Date().toLocaleDateString()

            };


            reviews.unshift(newReview);


            /* Save */

            localStorage.setItem(
                "reviews",
                JSON.stringify(reviews)
            );


            /* Clear form */

            reviewName.value = "";

            reviewText.value = "";

            ratingInput.value = "0";

            selectedImages = [];

            imagePreview.innerHTML = "";

            reviewImages.value = "";


            stars.forEach(star => {

                star.innerText = "☆";

                star.classList.remove("selected");

            });


            /* Show success */

            showToast("✅ Review submitted successfully!");


            /* Refresh reviews */

            displayReviews();

        });

    }


    /* =========================
       SHOW TOAST
    ========================= */

    function showToast(message) {

        if (!toast) return;

        toast.innerText = message;

        toast.classList.add("show");


        setTimeout(() => {

            toast.classList.remove("show");

        }, 3000);

    }


    /* =========================
       DISPLAY REVIEWS
    ========================= */

    function displayReviews() {

        if (!reviewList) return;


        const reviews =
            JSON.parse(localStorage.getItem("reviews")) || [];


        reviewList.innerHTML = "";


        if (reviews.length === 0) {

            reviewList.innerHTML = `

                <div class="no-reviews">

                    <div class="no-reviews-icon">
                        ⭐
                    </div>

                    <h3>No reviews yet</h3>

                    <p>
                        Be the first customer to share your experience!
                    </p>

                </div>

            `;

            return;

        }


        reviews.forEach(item => {

            const card = document.createElement("div");

            card.className = "review-card";


            /* Stars */

            let starsHTML = "";

            for (let i = 1; i <= 5; i++) {

                starsHTML +=
                    i <= item.rating ? "★" : "☆";

            }


            /* Images */

            let imagesHTML = "";

            if (item.images && item.images.length > 0) {

                imagesHTML = `

                    <div class="review-images">

                        ${item.images.map(image => `

                            <img
                                src="${image}"
                                alt="Customer review image"
                            >

                        `).join("")}

                    </div>

                `;

            }


            card.innerHTML = `

                <div class="review-header">

                    <div class="review-avatar">

                        ${item.name
                            .charAt(0)
                            .toUpperCase()}

                    </div>

                    <div>

                        <h3>
                            ${escapeHTML(item.name)}
                        </h3>

                        <div class="review-stars">
                            ${starsHTML}
                        </div>

                    </div>

                    <span class="review-date">
                        ${item.date}
                    </span>

                </div>


                <p class="review-message">

                    ${escapeHTML(item.review)}

                </p>


                ${imagesHTML}

            `;


            reviewList.appendChild(card);

        });

    }


    /* =========================
       SECURITY
    ========================= */

    function escapeHTML(text) {

        const div = document.createElement("div");

        div.textContent = text;

        return div.innerHTML;

    }


    /* =========================
       LOAD REVIEWS
    ========================= */

    displayReviews();

});
