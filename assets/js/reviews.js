let stars = document.querySelectorAll(".stars span");
let ratingInput = document.getElementById("rating");


stars.forEach(function(star){

    star.addEventListener("click", function(){

        let rating = this.dataset.star;

        ratingInput.value = rating;


        stars.forEach(function(s){

            if(s.dataset.star <= rating){

                s.innerText = "★";
                s.style.color = "#ffb703";

            }
            else{

                s.innerText = "☆";
                s.style.color = "#ccc";

            }

        });

    });

});
let submitButton = document.getElementById("submit-review");


submitButton.addEventListener("click", function(){


    let name = document.getElementById("review-name").value;

    let review = document.getElementById("review-text").value;


    if(name === "" || review === ""){

       let toast = document.getElementById("review-toast");

toast.innerText = "Please fill your name and review.";

toast.classList.add("show");


setTimeout(function(){

    toast.classList.remove("show");

},3000);
        return;

    }


    let reviews = JSON.parse(localStorage.getItem("reviews")) || [];


    reviews.push({

        name: name,

        review: review,

        date: new Date().toLocaleDateString()

    });


    localStorage.setItem(
        "reviews",
        JSON.stringify(reviews)
    );


    let toast = document.getElementById("review-toast");

toast.classList.add("show");


setTimeout(function(){

    toast.classList.remove("show");

},3000);


    document.getElementById("review-name").value = "";

    document.getElementById("review-text").value = "";


});