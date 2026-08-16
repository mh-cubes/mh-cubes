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

    /*
    ========================================
    DETECT PRODUCT
    ========================================
    */

    let productName = document.title
        .split("-")[0]
        .trim();

    if (!productName) {
        productName = "Unknown Product";
    }

    const reviewStorageKey = "reviews_" + productName;

    let selectedImages = [];


    /*
    ========================================
    STAR RATING
    ========================================
    */

    stars.forEach(star => {

        star.addEventListener("click", () => {

            const rating = Number(star.dataset.star);

            ratingInput.value = rating;

            stars.forEach(s => {

                const number = Number(s.dataset.star);

                if (number <= rating) {
                    s.innerText = "★";
                    s.classList.add("selected");
                } else {
                    s.innerText = "☆";
                    s.classList.remove("selected");
                }

            });

        });


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


    /*
    ========================================
    IMAGE UPLOAD
    PICTURES ARE OPTIONAL
    ========================================
    */

    if (reviewImages && imagePreview) {

        reviewImages.addEventListener("change", () => {

            selectedImages = [];

            imagePreview.innerHTML = "";

            const files = Array.from(reviewImages.files || []);

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


    /*
    ========================================
    SUBMIT REVIEW
    ========================================
    */

    if (submitButton) {

        submitButton.addEventListener("click", () => {

            /*
            IMPORTANT:
            Read values WITHOUT clearing them first.
            */

            const name = reviewName
                ? reviewName.value.trim()
                : "";

            const review = reviewText
                ? reviewText.value.trim()
                : "";

            const rating = ratingInput
                ? Number(ratingInput.value)
                : 0;


            /*
            VALIDATION
            */

            if (name === "") {

                showToast("⚠️ Please enter your name.");

                return;
            }


            if (review === "") {

                showToast("⚠️ Please write your review.");

                return;
            }


            if (rating === 0) {

                showToast("⭐ Please select a star rating.");

                return;
            }


            /*
            LOAD EXISTING REVIEWS
            */

            let reviews =
                JSON.parse(
                    localStorage.getItem(reviewStorageKey)
                ) || [];


            /*
            CREATE REVIEW
            */

            const newReview = {

                id: Date.now(),

                product: productName,

                name: name,

                review: review,

                rating: rating,

                images: selectedImages,

                date: new Date().toLocaleDateString()

            };


            reviews.unshift(newReview);


            /*
            SAVE REVIEW
            */

            localStorage.setItem(
                reviewStorageKey,
                JSON.stringify(reviews)
            );


            /*
            CLEAR FORM ONLY AFTER SUCCESS
            */

            if (reviewName) {
                reviewName.value = "";
            }

            if (reviewText) {
                reviewText.value = "";
            }

            if (ratingInput) {
                ratingInput.value = "0";
            }

            selectedImages = [];


            if (imagePreview) {
                imagePreview.innerHTML = "";
            }

            if (reviewImages) {
                reviewImages.value = "";
            }


            stars.forEach(star => {

                star.innerText = "☆";

                star.classList.remove("selected");

            });


            /*
            SUCCESS
            */

            showToast(
                "✅ Review submitted successfully!"
            );


            /*
            REFRESH REVIEWS
            */

            displayReviews();

        });

    }


    /*
    ========================================
    TOAST
    ========================================
    */

    function showToast(message) {

        if (!toast) return;

        toast.innerText = message;

        toast.classList.add("show");

        setTimeout(() => {

            toast.classList.remove("show");

        }, 3000);

    }


    /*
    ========================================
    DISPLAY REVIEWS
    ========================================
    */

    function displayReviews() {

        if (!reviewList) return;


        const reviews =
            JSON.parse(
                localStorage.getItem(reviewStorageKey)
            ) || [];


        reviewList.innerHTML = "";


        if (reviews.length === 0) {

            reviewList.innerHTML = `

                <div class="no-reviews">

                    <div class="no-reviews-icon">
                        ⭐
                    </div>

                    <h3>
                        No reviews yet
                    </h3>

                    <p>
                        Be the first customer to share
                        your experience!
                    </p>

                </div>

            `;

            return;

        }


        /*
        DISPLAY REVIEWS
        */

        reviews.forEach(item => {

            const card =
                document.createElement("div");

            card.className = "review-card";


            /*
            STARS
            */

            let starsHTML = "";

            for (let i = 1; i <= 5; i++) {

                starsHTML +=
                    i <= item.rating
                        ? "★"
                        : "☆";

            }


            /*
            IMAGES
            */

            let imagesHTML = "";

            if (
                item.images &&
                item.images.length > 0
            ) {

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


            /*
            REVIEW CARD
            */

            card.innerHTML = `

                <div class="review-header">

                    <div class="review-avatar">

                        ${escapeHTML(
                            item.name
                                .charAt(0)
                                .toUpperCase()
                        )}

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


    /*
    ========================================
    SECURITY
    ========================================
    */

    function escapeHTML(text) {

        const div =
            document.createElement("div");

        div.textContent = text;

        return div.innerHTML;

    }


    /*
    ========================================
    LOAD REVIEWS
    ========================================
    */

    displayReviews();

});
