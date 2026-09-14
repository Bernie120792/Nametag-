const LIBRARY_ID = "752623";

/*
    ILAGAY DITO ANG BUNNY STREAM API KEY MO
*/
const API_KEY = "f1814a26-eb38-4379-b630bd285d98-aee4-4368";


const API_BASE =
    "https://video.bunnycdn.com/library/" + LIBRARY_ID;


const ITEMS_PER_PAGE = 100;


/*
    ELEMENTS
*/

const videoGrid = document.getElementById("videoGrid");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("error");
const loadMoreBtn = document.getElementById("loadMoreBtn");

const searchInput = document.getElementById("searchInput");

const playerScreen = document.getElementById("playerScreen");
const player = document.getElementById("player");
const closePlayer = document.getElementById("closePlayer");


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

    const response = await fetch(
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

    const text = await response.text();

    if (!text) {
        throw new Error("Empty response from Bunny API.");
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

    return video.title ||
        "Untitled Video";
}


/*
    GET VIDEO THUMBNAIL
*/

function getVideoThumbnail(video) {

    /*
        Thumbnail must come from Bunny API.

        Walang manual thumbnail URL
        na ginagawa dito.
    */

    return (
        video.thumbnailUrl ||
        video.thumbnailURL ||
        video.thumbnail ||
        ""
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

    const seconds = Number(video.length);

    if (isNaN(seconds)) {
        return "";
    }

    const minutes = Math.floor(seconds / 60);

    const remainingSeconds =
        Math.floor(seconds % 60);

    return (
        minutes +
        ":" +
        String(remainingSeconds).padStart(2, "0")
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

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleDateString();
}


/*
    LOAD VIDEOS
*/

async function loadVideos() {

    if (isLoading || !hasMore) {
        return;
    }

    isLoading = true;

    loading.classList.remove("hidden");

    errorBox.classList.add("hidden");

    try {

        const result = await getVideos(
            currentPage,
            ITEMS_PER_PAGE
        );


        /*
            Bunny normally returns items
            inside "items".
        */

        const newVideos =
            Array.isArray(result)
                ? result
                : (
                    Array.isArray(result.items)
                        ? result.items
                        : []
                );


        if (newVideos.length === 0) {

            hasMore = false;

            loadMoreBtn.classList.add("hidden");

            if (videos.length === 0) {

                errorBox.textContent =
                    "Walang video na nakuha mula sa Bunny.";

                errorBox.classList.remove("hidden");
            }

            return;
        }


        /*
            ADD NEW VIDEOS
        */

        videos =
            videos.concat(newVideos);


        /*
            DISPLAY ONLY NEW VIDEOS
        */

        displayVideos(newVideos);


        /*
            CHECK PAGINATION
        */

        if (
            newVideos.length < ITEMS_PER_PAGE
        ) {

            hasMore = false;

            loadMoreBtn.classList.add("hidden");

        } else {

            currentPage++;

            loadMoreBtn.classList.remove("hidden");
        }

    } catch (error) {

        console.error(error);

        errorBox.textContent =
            "Hindi makakonekta sa Bunny API.";

        errorBox.classList.remove("hidden");

    } finally {

        isLoading = false;

        loading.classList.add("hidden");
    }
}


/*
    DISPLAY VIDEOS
*/

function displayVideos(videoList) {

    videoList.forEach(function(video) {

        const videoId =
            getVideoId(video);

        if (!videoId) {
            return;
        }


        const card =
            document.createElement("div");

        card.className =
            "videoCard";

        card.dataset.videoId =
            videoId;


        /*
            THUMBNAIL BOX
        */

        const thumbnailBox =
            document.createElement("div");

        thumbnailBox.className =
            "thumbnailBox";


        const thumbnailUrl =
            getVideoThumbnail(video);


        if (thumbnailUrl) {

            const image =
                document.createElement("img");

            image.className =
                "thumbnail";

            image.src =
                thumbnailUrl;

            image.alt =
                getVideoTitle(video);

            image.loading =
                "lazy";

            image.onerror =
                function() {

                    this.style.display =
                        "none";

                    const noThumbnail =
                        document.createElement("div");

                    noThumbnail.className =
                        "noThumbnail";

                    noThumbnail.textContent =
                        "No thumbnail";

                    thumbnailBox.appendChild(
                        noThumbnail
                    );
                };

            thumbnailBox.appendChild(
                image
            );

        } else {

            const noThumbnail =
                document.createElement("div");

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
            document.createElement("div");

        title.className =
            "videoTitle";

        title.textContent =
            getVideoTitle(video);


        /*
            INFO
        */

        const info =
            document.createElement("div");

        info.className =
            "videoInfo";


        const duration =
            getVideoDuration(video);

        const date =
            getVideoDate(video);


        let infoText = "";


        if (duration) {
            infoText += duration;
        }

        if (duration && date) {
            infoText += " • ";
        }

        if (date) {
            infoText += date;
        }


        info.textContent =
            infoText;


        /*
            CARD
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

                playVideo(videoId);

            }
        );


        videoGrid.appendChild(
            card
        );

    });
}


/*
    PLAY VIDEO
*/

function playVideo(videoId) {

    if (!videoId) {
        return;
    }


    /*
        BUNNY EMBED URL
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


    /*
        ISANG IFRAME LANG.

        SRC LANG ANG PINAPALITAN.
    */

    player.src =
        playerUrl;


    /*
        SHOW FULL PLAYER SCREEN
    */

    playerScreen.classList.remove(
        "hidden"
    );


    /*
        PREVENT BACKGROUND SCROLL
    */

    document.body.style.overflow =
        "hidden";
}


/*
    CLOSE PLAYER
*/

function closeVideoPlayer() {

    /*
        Tanggalin muna ang src
        para huminto ang video.
    */

    player.src = "";


    /*
        Hide player screen
    */

    playerScreen.classList.add(
        "hidden"
    );


    /*
        Enable scrolling again
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

    Sa setup na ito, hindi natin
    isasara kapag mismong iframe
    ang pinindot.
*/

playerScreen.addEventListener(
    "click",
    function(event) {

        if (
            event.target === playerScreen
        ) {

            closeVideoPlayer();

        }

    }
);


/*
    ANDROID BACK BUTTON / BROWSER BACK

    Kapag supported ng WebView,
    ito ang magiging fallback.
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

    Para sa browser/desktop.
*/

document.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Escape") {

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
                    getVideoTitle(video)
                        .toLowerCase();


                if (
                    title.includes(keyword)
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