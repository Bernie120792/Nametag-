const EDGE_URL =
    "https://bedyoscript-5rcjl.bunny.run";

const COLLECTION_ID =
    "257764af-3ad3-4d82-ad22-5ea2e96ae9a4";

let allVideos = [];

const gallery =
    document.getElementById("videoGallery");

const loading =
    document.getElementById("loading");

const errorMessage =
    document.getElementById("errorMessage");

const videoCount =
    document.getElementById("videoCount");

const player =
    document.getElementById("videoPlayer");

const videoTitle =
    document.getElementById("videoTitle");

const videoDetails =
    document.getElementById("videoDetails");

const searchInput =
    document.getElementById("searchInput");

const searchButton =
    document.getElementById("searchButton");


// ======================================
// LOAD VIDEOS
// ======================================

async function loadVideos() {

    loading.style.display = "block";
    loading.textContent = "Loading videos...";

    errorMessage.style.display = "none";

    gallery.innerHTML = "";

    const url =
        EDGE_URL +
        "/videos?collectionId=" +
        encodeURIComponent(COLLECTION_ID) +
        "&page=1&itemsPerPage=100";

    try {

        const response =
            await fetch(url);

        const text =
            await response.text();

        if (!response.ok) {
            throw new Error(
                "HTTP " + response.status
            );
        }

        const data =
            JSON.parse(text);

        if (
            !data.items ||
            !Array.isArray(data.items)
        ) {
            throw new Error(
                "Invalid video data"
            );
        }

        allVideos =
            data.items;

        renderVideos(allVideos);

        loading.style.display =
            "none";

    } catch (error) {

        console.error(
            "BEDYO ERROR:",
            error
        );

        loading.style.display =
            "none";

        errorMessage.style.display =
            "block";

        errorMessage.textContent =
            "Connection error: " +
            error.message;
    }
}


// ======================================
// RENDER VIDEOS
// ======================================

function renderVideos(videos) {

    gallery.innerHTML = "";

    videoCount.textContent =
        videos.length +
        (
            videos.length === 1
                ? " video"
                : " videos"
        );

    if (videos.length === 0) {

        gallery.innerHTML =
            '<div class="loading">No videos found.</div>';

        return;
    }


    videos.forEach(function(video) {

        const card =
            document.createElement("article");

        card.className =
            "video-card";


        // -----------------------------
        // THUMBNAIL
        // -----------------------------

        const thumbnailContainer =
            document.createElement("div");

        thumbnailContainer.className =
            "thumbnail-container";


        const image =
            document.createElement("img");

        image.className =
            "thumbnail";

        image.src =
            video.thumbnailUrl;

        image.alt =
            video.title ||
            "BEDYO video";

        image.loading =
            "lazy";


        // -----------------------------
        // PLAY BUTTON
        // -----------------------------

        const overlay =
            document.createElement("div");

        overlay.className =
            "play-overlay";


        const playButton =
            document.createElement("div");

        playButton.className =
            "play-button";

        playButton.textContent =
            "▶";


        overlay.appendChild(
            playButton
        );


        // -----------------------------
        // DURATION
        // -----------------------------

        const duration =
            document.createElement("span");

        duration.className =
            "duration";

        duration.textContent =
            formatDuration(
                video.length
            );


        thumbnailContainer.appendChild(
            image
        );

        thumbnailContainer.appendChild(
            overlay
        );

        thumbnailContainer.appendChild(
            duration
        );


        // -----------------------------
        // INFO
        // -----------------------------

        const info =
            document.createElement("div");

        info.className =
            "card-info";


        const avatar =
            document.createElement("div");

        avatar.className =
            "card-avatar";

        avatar.textContent =
            "B";


        const text =
            document.createElement("div");

        text.className =
            "card-text";


        // TITLE

        const title =
            document.createElement("h3");

        title.className =
            "card-title";

        title.textContent =
            video.title ||
            "Untitled video";


        // META

        const meta =
            document.createElement("div");

        meta.className =
            "card-meta";


        meta.textContent =
            "BEDYO • " +
            formatViews(video.views) +
            " views • " +
            formatUploadDate(
                video.dateUploaded
            );


        text.appendChild(
            title
        );

        text.appendChild(
            meta
        );


        info.appendChild(
            avatar
        );

        info.appendChild(
            text
        );


        card.appendChild(
            thumbnailContainer
        );

        card.appendChild(
            info
        );


        // -----------------------------
        // CLICK
        // -----------------------------

        card.addEventListener(
            "click",
            function() {

                playVideo(video);

            }
        );


        gallery.appendChild(
            card
        );

    });
}


// ======================================
// PLAY VIDEO
// ======================================

function playVideo(video) {

    if (
        !video ||
        !video.guid
    ) {
        return;
    }


    let hostname = "";


    try {

        hostname =
            new URL(
                video.thumbnailUrl
            ).hostname;

    } catch (error) {

        console.error(
            error
        );

        return;
    }


    if (!hostname) {
        return;
    }


    const videoUrl =
        "https://" +
        hostname +
        "/" +
        video.guid +
        "/play_720p.mp4";


    player.src =
        videoUrl;

    player.load();


    videoTitle.textContent =
        video.title ||
        "Untitled video";


    videoDetails.textContent =
        "BEDYO • " +
        formatViews(video.views) +
        " views • " +
        formatUploadDate(
            video.dateUploaded
        );


    player.play().catch(
        function() {}
    );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ======================================
// SEARCH
// ======================================

function searchVideos() {

    const keyword =
        searchInput.value
            .trim()
            .toLowerCase();


    if (keyword === "") {

        renderVideos(
            allVideos
        );

        return;
    }


    const results =
        allVideos.filter(
            function(video) {

                const title =
                    (
                        video.title ||
                        ""
                    ).toLowerCase();

                return title.includes(
                    keyword
                );
            }
        );


    renderVideos(
        results
    );
}


searchButton.addEventListener(
    "click",
    searchVideos
);


searchInput.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {
            searchVideos();
        }

    }
);


searchInput.addEventListener(
    "input",
    searchVideos
);


// ======================================
// FORMAT VIEWS
// ======================================

function formatViews(views) {

    views =
        Number(views) || 0;


    if (views >= 1000000) {

        return (
            (views / 1000000)
                .toFixed(1)
                .replace(".0", "") +
            "M"
        );
    }


    if (views >= 1000) {

        return (
            (views / 1000)
                .toFixed(1)
                .replace(".0", "") +
            "K"
        );
    }


    return String(views);
}


// ======================================
// FORMAT UPLOAD DATE
// ======================================

function formatUploadDate(date) {

    if (!date) {
        return "Unknown date";
    }


    /*
       Bunny date has no timezone:
       2026-09-15T09:01:11.764

       Treat it as the upload timestamp
       returned by Bunny.
    */

    const uploaded =
        new Date(
            date + "Z"
        );


    if (
        isNaN(
            uploaded.getTime()
        )
    ) {
        return "Unknown date";
    }


    const now =
        new Date();


    const difference =
        now.getTime() -
        uploaded.getTime();


    const seconds =
        Math.floor(
            difference / 1000
        );


    const minutes =
        Math.floor(
            seconds / 60
        );


    const hours =
        Math.floor(
            minutes / 60
        );


    const days =
        Math.floor(
            hours / 24
        );


    if (seconds < 60) {
        return "just now";
    }


    if (minutes < 60) {

        return (
            minutes +
            (
                minutes === 1
                    ? " minute ago"
                    : " minutes ago"
            )
        );
    }


    if (hours < 24) {

        return (
            hours +
            (
                hours === 1
                    ? " hour ago"
                    : " hours ago"
            )
        );
    }


    if (days < 7) {

        return (
            days +
            (
                days === 1
                    ? " day ago"
                    : " days ago"
            )
        );
    }


    return uploaded.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );
}


// ======================================
// FORMAT DURATION
// ======================================

function formatDuration(seconds) {

    seconds =
        Number(seconds) || 0;


    const hours =
        Math.floor(
            seconds / 3600
        );


    const minutes =
        Math.floor(
            (seconds % 3600) / 60
        );


    const secs =
        Math.floor(
            seconds % 60
        );


    if (hours > 0) {

        return (
            hours +
            ":" +
            String(minutes)
                .padStart(2, "0") +
            ":" +
            String(secs)
                .padStart(2, "0")
        );
    }


    return (
        minutes +
        ":" +
        String(secs)
            .padStart(2, "0")
    );
}


// ======================================
// START
// ======================================

loadVideos();
