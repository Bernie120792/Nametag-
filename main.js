const pageFrame =
    document.getElementById("pageFrame");


const buttons =
    document.querySelectorAll(".nav-button");


/* =========================
   CHANGE HTML
========================= */

function openPage(page) {

    pageFrame.src = page;


    /* ACTIVE BUTTON */

    buttons.forEach(function(button) {

        button.classList.remove("active");


        if (
            button.dataset.page === page
        ) {

            button.classList.add("active");

        }

    });


    /* SCROLL TOP */

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================
   NAVIGATION
========================= */

buttons.forEach(function(button) {

    button.addEventListener(
        "click",
        function() {

            const page =
                this.dataset.page;

            openPage(page);

        }
    );

});


/* =========================
   START
========================= */

openPage("home.html");
