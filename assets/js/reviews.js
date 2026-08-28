
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

    const imageInput = document.getElementById("review-images");
    const imagePreview = document.getElementById("image-preview");


    if (
        !nameInput ||
        !reviewInput ||
        !ratingInput ||
        !submitButton
    ) {
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
    // OWNER UID
    // =========================================

    const ownerUID =
        "UPdmuwyLEcdEyMxFENPGRlAhxwa2";


    // =========================================
    // SELECTED IMAGES
    // =========================================

    let selectedImages = [];


    // =========================================
    // STAR RATING
    // =========================================

    stars.forEach((star) => {

        star.addEventListener("click", () => {

            const rating =
                Number(star.dataset.star);

            if (!rating) return;

            ratingInput.value = String(rating);


            stars.forEach((s) => {

                const number =
                    Number(s.dataset.star);

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
    // IMAGE COMPRESSION
    // =========================================

    function compressImage(file) {

        return new Promise((resolve, reject) => {

            const reader =
                new FileReader();


            reader.onload = (event) => {

                const img =
                    new Image();


                img.onload = () => {

                    const maxWidth = 900;
                    const maxHeight = 900;

                    let width = img.width;
                    let height = img.height;


                    if (
                        width > maxWidth ||
                        height > maxHeight
                    ) {

                        const ratio =
                            Math.min(
                                maxWidth / width,
                                maxHeight / height
                            );

                        width =
                            Math.round(width * ratio);

                        height =
                            Math.round(height * ratio);

                    }


                    const canvas =
                        document.createElement(
                            "canvas"
                        );


                    canvas.width = width;
                    canvas.height = height;


                    const context =
                        canvas.getContext("2d");


                    context.drawImage(
                        img,
                        0,
                        0,
                        width,
                        height
                    );


                    const compressed =
                        canvas.toDataURL(
                            "image/jpeg",
                            0.60
                        );


                    resolve(compressed);

                };


                img.onerror = () => {

                    reject(
                        new Error(
                            "Could not load image."
                        )
                    );

                };


                img.src =
                    event.target.result;

            };


            reader.onerror = () => {

                reject(
                    new Error(
                        "Could not read image."
                    )
                );

            };


            reader.readAsDataURL(file);

        });

    }


    // =========================================
    // IMAGE PREVIEW
    // =========================================

    function createImagePreview(imageData) {

        if (!imagePreview) return;


        const wrapper =
            document.createElement("div");

        wrapper.className =
            "review-preview-wrapper";


        const image =
            document.createElement("img");

        image.src = imageData;

        image.alt =
            "Selected review image";

        image.className =
            "review-preview-image";


        const removeButton =
            document.createElement("button");

        removeButton.type = "button";

        removeButton.className =
            "remove-preview-image";

        removeButton.textContent = "×";

        removeButton.title =
            "Remove image";


        removeButton.addEventListener(
            "click",
            () => {

                const index =
                    selectedImages.indexOf(
                        imageData
                    );


                if (index !== -1) {

                    selectedImages.splice(
                        index,
                        1
                    );

                }


                wrapper.remove();

            }
        );


        wrapper.appendChild(image);
        wrapper.appendChild(removeButton);

        imagePreview.appendChild(wrapper);

    }


    // =========================================
    // IMAGE UPLOAD
    // =========================================

    if (imageInput) {

        imageInput.addEventListener(
            "change",
            async () => {

                const files =
                    Array.from(
                        imageInput.files
                    );


                if (
                    selectedImages.length +
                    files.length > 5
                ) {

                    showToast(
                        "Maximum 5 images allowed."
                    );

                    imageInput.value = "";

                    return;

                }


                for (const file of files) {

                    if (
                        !file.type.startsWith(
                            "image/"
                        )
                    ) {

                        showToast(
                            "Please select image files only."
                        );

                        continue;

                    }


                    try {

                        showToast(
                            "Processing image..."
                        );


                        const imageData =
                            await compressImage(
                                file
                            );


                        selectedImages.push(
                            imageData
                        );


                        createImagePreview(
                            imageData
                        );


                    } catch (error) {

                        console.error(
                            "Image processing error:",
                            error
                        );

                        showToast(
                            "Failed to process image."
                        );

                    }

                }


                imageInput.value = "";

            }
        );

    }


    // =========================================
    // SUBMIT REVIEW
    // =========================================

    submitButton.addEventListener(
        "click",
        async () => {

            const currentUser =
                auth.currentUser;


            // LOGIN CHECK

            if (!currentUser) {

                showToast(
                    "Please login before submitting a review."
                );

                return;

            }


            const name =
                nameInput.value.trim();

            const review =
                reviewInput.value.trim();

            const rating =
                Number(ratingInput.value);


            // NAME

            if (!name) {

                showToast(
                    "Please enter your name."
                );

                nameInput.focus();

                return;

            }


            // REVIEW

            if (!review) {

                showToast(
                    "Please write your review."
                );

                reviewInput.focus();

                return;

            }


            // RATING

            if (
                rating < 1 ||
                rating > 5
            ) {

                showToast(
                    "Please select a star rating."
                );

                return;

            }


            try {

                submitButton.disabled = true;

                submitButton.textContent =
                    "Submitting...";


                // =================================
                // REVIEW DATA
                // =================================

                const reviewData = {

                    product:
                        productName,

                    name:
                        name,

                    review:
                        review,

                    rating:
                        rating,

                    customerUID:
                        currentUser.uid,

                    images:
                        selectedImages,

                    date:
                        new Date()
                            .toLocaleDateString(),

                    createdAt:
                        Date.now()

                };


                // =================================
                // SAVE TO FIRESTORE
                // =================================

                await addDoc(
                    collection(
                        db,
                        "reviews"
                    ),
                    reviewData
                );


                // =================================
                // RESET FORM
                // =================================

                nameInput.value = "";

                reviewInput.value = "";

                ratingInput.value = "0";


                selectedImages = [];


                if (imagePreview) {

                    imagePreview.innerHTML =
                        "";

                }


                stars.forEach((star) => {

                    star.textContent =
                        "☆";

                    star.classList.remove(
                        "selected"
                    );

                });


                showToast(
                    "Review submitted successfully!"
                );


                await displayReviews();


            } catch (error) {

                console.error(
                    "FULL SUBMIT ERROR:",
                    error
                );


                showToast(
                    "Failed to submit review: " +
                    error.message
                );


            } finally {

                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "Submit Review";

            }

        }
    );


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

            const reviewsQuery =
                query(
                    collection(
                        db,
                        "reviews"
                    ),
                    where(
                        "product",
                        "==",
                        productName
                    )
                );


            const snapshot =
                await getDocs(
                    reviewsQuery
                );


            const reviews = [];


            snapshot.forEach(
                (reviewDoc) => {

                    reviews.push({

                        id:
                            reviewDoc.id,

                        ...reviewDoc.data()

                    });

                }
            );


            // NEWEST FIRST

            reviews.sort(
                (a, b) =>
                    (b.createdAt || 0) -
                    (a.createdAt || 0)
            );


            reviewList.innerHTML = "";


            // NO REVIEWS

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
                            Be the first customer to share your experience!
                        </p>

                    </div>
                `;

                return;

            }


            const currentUser =
                auth.currentUser;


            // =================================
            // EACH REVIEW
            // =================================

            reviews.forEach((item) => {

                const card =
                    document.createElement(
                        "div"
                    );

                card.className =
                    "review-card";


                // =================================
                // HEADER
                // =================================

                const header =
                    document.createElement(
                        "div"
                    );

                header.className =
                    "review-header";


                // AVATAR

                const avatar =
                    document.createElement(
                        "div"
                    );

                avatar.className =
                    "review-avatar";

                avatar.textContent =
                    String(
                        item.name || "?"
                    )
                    .charAt(0)
                    .toUpperCase();


                // USER

                const user =
                    document.createElement(
                        "div"
                    );

                user.className =
                    "review-user";


                const username =
                    document.createElement(
                        "h3"
                    );

                username.textContent =
                    item.name ||
                    "Customer";


                // STARS

                const reviewStars =
                    document.createElement(
                        "div"
                    );

                reviewStars.className =
                    "review-stars";


                for (
                    let i = 1;
                    i <= 5;
                    i++
                ) {

                    reviewStars.textContent +=
                        i <= Number(
                            item.rating
                        )
                            ? "★"
                            : "☆";

                }


                user.appendChild(
                    username
                );

                user.appendChild(
                    reviewStars
                );


                // DATE

                const date =
                    document.createElement(
                        "span"
                    );

                date.className =
                    "review-date";

                date.textContent =
                    item.date || "";


                // =================================
                // DELETE BUTTON
                // =================================

                const menuContainer =
                    document.createElement(
                        "div"
                    );

                menuContainer.className =
                    "review-menu";


                const isOwner =
                    currentUser &&
                    currentUser.uid ===
                    ownerUID;


                const isReviewOwner =
                    currentUser &&
                    item.customerUID &&
                    item.customerUID ===
                    currentUser.uid;


                if (
                    isOwner ||
                    isReviewOwner
                ) {

                    const deleteButton =
                        document.createElement(
                            "button"
                        );


                    deleteButton.type =
                        "button";


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


                            if (!confirmed)
                                return;


                            try {

                                deleteButton.disabled =
                                    true;


                                deleteButton.textContent =
                                    "⏳";


                                await deleteDoc(
                                    doc(
                                        db,
                                        "reviews",
                                        item.id
                                    )
                                );


                                showToast(
                                    "Review deleted successfully!"
                                );


                                await displayReviews();


                            } catch (error) {

                                console.error(
                                    "DELETE REVIEW ERROR:",
                                    error
                                );


                                showToast(
                                    "Failed to delete review: " +
                                    error.message
                                );


                                deleteButton.disabled =
                                    false;

                                deleteButton.textContent =
                                    "🗑️";

                            }

                        }
                    );


                    menuContainer.appendChild(
                        deleteButton
                    );

                }


                // =================================
                // HEADER APPEND
                // =================================

                header.appendChild(
                    avatar
                );

                header.appendChild(
                    user
                );

                header.appendChild(
                    date
                );

                header.appendChild(
                    menuContainer
                );


                // =================================
                // REVIEW MESSAGE
                // =================================

                const message =
                    document.createElement(
                        "p"
                    );

                message.className =
                    "review-message";

                message.textContent =
                    item.review || "";


                // =================================
                // REVIEW IMAGES
                // =================================

                const images =
                    Array.isArray(
                        item.images
                    )
                        ? item.images
                        : [];


                if (images.length > 0) {

                    const imagesContainer =
                        document.createElement(
                            "div"
                        );

                    imagesContainer.className =
                        "review-images";


                    images.forEach(
                        (imageSrc) => {

                            const image =
                                document.createElement(
                                    "img"
                                );


                            image.src =
                                imageSrc;


                            image.alt =
                                "Customer review image";


                            image.className =
                                "review-image";


                            image.addEventListener(
                                "click",
                                () => {

                                    openImageViewer(
                                        imageSrc
                                    );

                                }
                            );


                            imagesContainer.appendChild(
                                image
                            );

                        }
                    );


                    card.appendChild(
                        imagesContainer
                    );

                }


                // =================================
                // CARD APPEND
                // =================================

                card.appendChild(
                    header
                );

                card.appendChild(
                    message
                );


                reviewList.appendChild(
                    card
                );

            });


        } catch (error) {

            console.error(
                "LOAD REVIEWS ERROR:",
                error
            );


            reviewList.innerHTML = `
                <div class="no-reviews">

                    <h3>
                        Unable to load reviews
                    </h3>

                    <p>
                        Please try again later.
                    </p>

                </div>
            `;

        }

    }


    // =========================================
    // IMAGE VIEWER
    // =========================================

    function openImageViewer(imageSrc) {

        const oldViewer =
            document.querySelector(
                ".review-image-viewer"
            );


        if (oldViewer) {

            oldViewer.remove();

        }


        const viewer =
            document.createElement(
                "div"
            );

        viewer.className =
            "review-image-viewer";


        const image =
            document.createElement(
                "img"
            );

        image.src =
            imageSrc;

        image.alt =
            "Enlarged review image";


        const closeButton =
            document.createElement(
                "button"
            );

        closeButton.className =
            "review-image-viewer-close";

        closeButton.type =
            "button";

        closeButton.textContent =
            "×";


        viewer.appendChild(
            image
        );

        viewer.appendChild(
            closeButton
        );


        document.body.appendChild(
            viewer
        );


        requestAnimationFrame(() => {

            viewer.classList.add(
                "show"
            );

        });


        closeButton.addEventListener(
            "click",
            closeImageViewer
        );


        viewer.addEventListener(
            "click",
            (event) => {

                if (
                    event.target ===
                    viewer
                ) {

                    closeImageViewer();

                }

            }
        );


        document.addEventListener(
            "keydown",
            imageViewerEscapeHandler
        );

    }


    // =========================================
    // CLOSE IMAGE VIEWER
    // =========================================

    function closeImageViewer() {

        const viewer =
            document.querySelector(
                ".review-image-viewer"
            );


        if (!viewer) return;


        viewer.classList.remove(
            "show"
        );


        setTimeout(() => {

            viewer.remove();

        }, 250);


        document.removeEventListener(
            "keydown",
            imageViewerEscapeHandler
        );

    }


    // =========================================
    // ESC KEY
    // =========================================

    function imageViewerEscapeHandler(
        event
    ) {

        if (
            event.key ===
            "Escape"
        ) {

            closeImageViewer();

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


        toast.textContent =
            message;


        toast.classList.add(
            "show"
        );


        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 3500);

    }


    // =========================================
    // AUTH STATE
    // =========================================

    onAuthStateChanged(
        auth,
        () => {

            displayReviews();

        }
    );

});

