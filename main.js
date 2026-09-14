const LIBRARY_ID = "752623";

/*
    ILAGAY DITO ANG BUNNY STREAM API KEY MO
*/
const API_KEY = "f1814a26-eb38-4379-b630bd285d98-aee4-4368";


/*
    BUNNY API
*/

const API_BASE =
    "https://video.bunnycdn.com/library/" +
    LIBRARY_ID;


/*
    ACTUAL BUNNY CDN HOSTNAME
*/

const CDN_BASE =
    "https://vz-44e1c5b3-3fc.b-cdn.net";


const ITEMS_PER_PAGE = 100;


/*
    ELEMENTS
*/

const videoGrid =
    document.getElementById("videoGrid");

const loading =
    document.getElementById("loading");

const errorBox =
    document.getElementById("error");

const loadMoreBtn =
    document.getElementById("loadMoreBtn");

const searchInput =
    document.getElementById("searchInput");

const playerScreen =
    document.getElementById("playerScreen");

const player =
    document.getElementById("player");

const closePlayer =
    document.getElementById("closePlayer");


/*
    VARIABLES
*/

let videos = [];

let currentPage = 1;

let hasMore = true;

let isLoading = false;


/*
    BUNNY API FUNCTION
*/

async function bunnyAPI(endpoint) {

    const response =
        await fetch(
            API_BASE + endpoint,
            {
                method: "GET",

                headers: {
                    "AccessKey": API_KEY,
                    "Accept": "application/json"
                },

                cache: "no-store"
            }
        );


    if (!response.ok) {

        throw new Error(
            "Bunny API Error: " +
            response.status
        );

    }


    const text =
        await response.text();


    if (!text) {

        throw new Error(
            "Empty response from Bunny API."
        );

    }


    try {

        return JSON.parse(text);

    } catch (error) {

        throw new Error(
            "Invalid JSON response from Bunny API."
        );

    }
}


/*
    GET VIDEOS
*/

async function getVideos(
    page = 1,
    itemsPerPage = ITEMS_PER_PAGE
) {

    const endpoint =
        "/videos?page=" +
        page +
        "&itemsPerPage=" +
        itemsPerPage +
        "&orderBy=date";


    return await bunnyAPI(endpoint);
}


/*
    GET VIDEO ID
*/

function getVideoId(video) {

    return video.guid || "";

}


/*
    GET VIDEO TITLE
*/

function getVideoTitle(video) {

    return (
        video.title ||
        "Untitled Video"
    );

}


/*
    GET VIDEO THUMBNAIL
*/

function getVideoThumbnail(video) {

    /*
        Kung may thumbnail URL mismo
        sa Bunny API, gamitin iyon.
    */

    if (video.thumbnailUrl) {

        return video.thumbnailUrl;

    }


    if (video.thumbnailURL) {

        return video.thumbnailURL;

    }


    if (video.thumbnail) {

        return video.thumbnail;

    }


    /*
        KUNIN ANG VIDEO GUID
    */

    const videoId =
        getVideoId(video);


    if (!videoId) {

        return "";

    }


    /*
        Kung may thumbnailFileName
        mula sa Bunny API.
    */

    if (video.thumbnailFileName) {

        return (
            CDN_BASE +
            "/" +
            videoId +
            "/" +
            video.thumbnailFileName
        );

    }


    /*
        STANDARD BUNNY THUMBNAIL
    */

    return (
        CDN_BASE +
        "/" +
        videoId +
        "/thumbnail.jpg"
    );
}


/*
    GET VIDEO DURATION
*/

function getVideoDuration(video) {

    if (
        video.length === undefined ||
        video.length === null
    ) {

        return "";

    }


    const seconds =
        Number(video.length);


    if (isNaN(seconds)) {

        return "";

    }


    const minutes =
        Math.floor(
            seconds / 60
        );


    const remainingSeconds =
        Math.floor(
            seconds % 60
        );


    return (
        minutes +
        ":" +
        String(
            remainingSeconds
        ).padStart(2, "0")
    );
}


/*
    GET VIDEO DATE
*/

function getVideoDate(video) {

    const dateValue =
        video.dateUploaded ||
        video.dateCreated ||
        "";


    if (!dateValue) {

        return "";

    }


    const date =
        new Date(dateValue);


    if (isNaN(date.getTime())) {

        return "";

    }


    return date.toLocaleDateString();
}


/*
    LOAD VIDEOS
*/

async function loadVideos() {

    if (
        isLoading ||
        !hasMore
    ) {

        return;

    }


    isLoading = true;


    loading.classList.remove(
        "hidden"
    );


    errorBox.classList.add(
        "hidden"
    );


    try {

        const result =
            await getVideos(
                currentPage,
                ITEMS_PER_PAGE
            );


        /*
            BUNNY RESPONSE

            {
                items: [...]
            }
        */

        const newVideos =
            Array.isArray(result)
                ? result
                : (
                    Array.isArray(
                        result.items
                    )
                        ? result.items
                        : []
                );


        /*
            WALANG VIDEO
        */

        if (
            newVideos.length === 0
        ) {

            hasMore = false;


            loadMoreBtn.classList.add(
                "hidden"
            );


            if (
                videos.length === 0
            ) {

                errorBox.textContent =
                    "Walang video na nakuha mula sa Bunny.";

                errorBox.classList.remove(
                    "hidden"
                );

            }


            return;

        }


        /*
            SAVE VIDEOS
        */

        videos =
            videos.concat(
                newVideos
            );


        /*
            DISPLAY VIDEOS
        */

        displayVideos(
            newVideos
        );


        /*
            PAGINATION
        */

        if (
            newVideos.length <
            ITEMS_PER_PAGE
        ) {

            hasMore = false;


            loadMoreBtn.classList.add(
                "hidden"
            );

        } else {

            currentPage++;


            loadMoreBtn.classList.remove(
                "hidden"
            );

        }


    } catch (error) {

        console.error(
            error
        );


        errorBox.textContent =
            "Hindi makakonekta sa Bunny API.";


        errorBox.classList.remove(
            "hidden"
        );


    } finally {

        isLoading = false;


        loading.classList.add(
            "hidden"
        );

    }
}


/*
    DISPLAY VIDEOS
*/

function displayVideos(videoList) {

    videoList.forEach(
        function(video) {

            const videoId =
                getVideoId(video);


            if (!videoId) {

                return;

            }


            /*
                VIDEO CARD
            */

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "videoCard";


            card.dataset.videoId =
                videoId;


            /*
                THUMBNAIL BOX
            */

            const thumbnailBox =
                document.createElement(
                    "div"
                );


            thumbnailBox.className =
                "thumbnailBox";


            /*
                THUMBNAIL URL
            */

            const thumbnailUrl =
                getVideoThumbnail(
                    video
                );


            /*
                IMAGE
            */

            if (thumbnailUrl) {

                const image =
                    document.createElement(
                        "img"
                    );


                image.className =
                    "thumbnail";


                image.src =
                    thumbnailUrl;


                image.alt =
                    getVideoTitle(
                        video
                    );


                image.loading =
                    "lazy";


                /*
                    KAPAG ERROR ANG THUMBNAIL
                */

                image.onerror =
                    function() {

                        this.style.display =
                            "none";


                        if (
                            !thumbnailBox.querySelector(
                                ".noThumbnail"
                            )
                        ) {

                            const noThumbnail =
                                document.createElement(
                                    "div"
                                );


                            noThumbnail.className =
                                "noThumbnail";


                            noThumbnail.textContent =
                                "No thumbnail";


                            thumbnailBox.appendChild(
                                noThumbnail
                            );

                        }

                    };


                thumbnailBox.appendChild(
                    image
                );

            } else {

                const noThumbnail =
                    document.createElement(
                        "div"
                    );


                noThumbnail.className =
                    "noThumbnail";


                noThumbnail.textContent =
                    "No thumbnail";


                thumbnailBox.appendChild(
                    noThumbnail
                );

            }


            /*
                TITLE
            */

            const title =
                document.createElement(
                    "div"
                );


            title.className =
                "videoTitle";


            title.textContent =
                getVideoTitle(
                    video
                );


            /*
                INFO
            */

            const info =
                document.createElement(
                    "div"
                );


            info.className =
                "videoInfo";


            const duration =
                getVideoDuration(
                    video
                );


            const date =
                getVideoDate(
                    video
                );


            let infoText = "";


            if (duration) {

                infoText += duration;

            }


            if (
                duration &&
                date
            ) {

                infoText +=
                    " • ";

            }


            if (date) {

                infoText += date;

            }


            info.textContent =
                infoText;


            /*
                ADD CONTENT
            */

            card.appendChild(
                thumbnailBox
            );


            card.appendChild(
                title
            );


            card.appendChild(
                info
            );


            /*
                CLICK VIDEO
            */

            card.addEventListener(
                "click",
                function() {

                    playVideo(
                        videoId
                    );

                }
            );


            /*
                ADD CARD
            */

            videoGrid.appendChild(
                card
            );

        }
    );
}


/*
    PLAY VIDEO
*/

function playVideo(videoId) {

    if (!videoId) {

        return;

    }


    /*
        BUNNY PLAYER
    */

    const playerUrl =
        "https://player.mediadelivery.net/embed/" +
        LIBRARY_ID +
        "/" +
        videoId +
        "?autoplay=true" +
        "&loop=false" +
        "&muted=false" +
        "&preload=true" +
        "&responsive=true";


    player.src =
        playerUrl;


    /*
        SHOW PLAYER
    */

    playerScreen.classList.remove(
        "hidden"
    );


    /*
        STOP BACKGROUND SCROLL
    */

    document.body.style.overflow =
        "hidden";
}


/*
    CLOSE VIDEO PLAYER
*/

function closeVideoPlayer() {

    /*
        STOP VIDEO
    */

    player.src = "";


    /*
        HIDE PLAYER
    */

    playerScreen.classList.add(
        "hidden"
    );


    /*
        ENABLE SCROLL
    */

    document.body.style.overflow =
        "";
}


/*
    CLOSE BUTTON
*/

closePlayer.addEventListener(
    "click",
    function() {

        closeVideoPlayer();

    }
);


/*
    CLICK OUTSIDE PLAYER
*/

playerScreen.addEventListener(
    "click",
    function(event) {

        if (
            event.target ===
            playerScreen
        ) {

            closeVideoPlayer();

        }

    }
);


/*
    BROWSER BACK
*/

window.addEventListener(
    "popstate",
    function() {

        if (
            !playerScreen.classList.contains(
                "hidden"
            )
        ) {

            closeVideoPlayer();

        }

    }
);


/*
    ESC KEY
*/

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key ===
            "Escape"
        ) {

            closeVideoPlayer();

        }

    }
);


/*
    SEARCH
*/

searchInput.addEventListener(
    "input",
    function() {

        const keyword =
            searchInput.value
                .trim()
                .toLowerCase();


        const cards =
            videoGrid.querySelectorAll(
                ".videoCard"
            );


        cards.forEach(
            function(card) {

                const videoId =
                    card.dataset.videoId;


                const video =
                    videos.find(
                        function(item) {

                            return (
                                getVideoId(item) ===
                                videoId
                            );

                        }
                    );


                if (!video) {

                    return;

                }


                const title =
                    getVideoTitle(
                        video
                    ).toLowerCase();


                if (
                    title.includes(
                        keyword
                    )
                ) {

                    card.style.display =
                        "";

                } else {

                    card.style.display =
                        "none";

                }

            }
        );

    }
);


/*
    LOAD MORE
*/

loadMoreBtn.addEventListener(
    "click",
    function() {

        loadVideos();

    }
);


/*
    START
*/

loadVideos();
