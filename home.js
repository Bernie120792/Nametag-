const EDGE_URL =
    "https://bedyompin-4kpra.bunny.run";

const COLLECTION_ID =
    "257764af-3ad3-4d82-ad22-5ea2e96ae9a4";


const videoGallery =
    document.getElementById("videoGallery");

const videoPlayer =
    document.getElementById("videoPlayer");

const videoTitle =
    document.getElementById("videoTitle");

const videoDetails =
    document.getElementById("videoDetails");

const videoCount =
    document.getElementById("videoCount");

const loading =
    document.getElementById("loading");

const errorMessage =
    document.getElementById("errorMessage");

const playerLoading =
    document.getElementById("playerLoading");

const homeBtn =
    document.getElementById("homeBtn");

const searchInput =
    document.getElementById("searchInput");

const searchBtn =
    document.getElementById("searchBtn");


const loginScreen =
    document.getElementById("loginScreen");

const app =
    document.getElementById("app");

const mpinInput =
    document.getElementById("mpinInput");

const loginBtn =
    document.getElementById("loginBtn");

const loginLoading =
    document.getElementById("loginLoading");

const loginError =
    document.getElementById("loginError");


let videos = [];
let filteredVideos = [];
let selectedVideo = null;
let loadingVideos = false;
let loggingIn = false;


/* DEVICE ID */

function getDeviceId() {

    let deviceId =
        localStorage.getItem(
            "bedyo_device_id"
        );

    if (!deviceId) {

        if (
            window.crypto &&
            crypto.randomUUID
        ) {

            deviceId =
                crypto.randomUUID();

        } else {

            deviceId =
                "BEDYO-" +
                Date.now() +
                "-" +
                Math.random()
                    .toString(36)
                    .substring(2, 12);
        }

        localStorage.setItem(
            "bedyo_device_id",
            deviceId
        );
    }

    return deviceId;
}


/* SESSION */

function getSessionToken() {

    return localStorage.getItem(
        "bedyo_session_token"
    );
}


function saveSessionToken(token) {

    localStorage.setItem(
        "bedyo_session_token",
        token
    );
}


function clearSession() {

    localStorage.removeItem(
        "bedyo_session_token"
    );

    videos = [];
    filteredVideos = [];

    videoGallery.innerHTML = "";

    app.classList.add("hidden");

    loginScreen.classList.remove(
        "hidden"
    );

    mpinInput.value = "";

    mpinInput.focus();
}


/* LOGIN */

async function login() {

    if (loggingIn) {
        return;
    }

    const mpin =
        mpinInput.value.trim();

    if (
        !/^\d{6}$/.test(mpin)
    ) {

        showLoginError(
            "Please enter your 6-digit MPIN."
        );

        return;
    }

    loggingIn = true;

    loginBtn.disabled = true;

    loginError.classList.remove(
        "show"
    );

    loginLoading.style.display =
        "flex";

    try {

        const deviceId =
            getDeviceId();

        const response =
            await fetch(
                EDGE_URL + "/auth",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            mpin: mpin,
                            deviceId:
                                deviceId
                        }),

                    cache: "no-store"
                }
            );

        const text =
            await response.text();

        let data;

        try {

            data =
                JSON.parse(text);

        } catch (error) {

            throw new Error(
                "Invalid server response"
            );
        }

        if (
            !response.ok ||
            !data.success ||
            !data.authorized
        ) {

            throw new Error(
                data.error ||
                "Login failed"
            );
        }

        if (!data.token) {

            throw new Error(
                "No session token received"
            );
        }

        saveSessionToken(
            data.token
        );

        loginScreen.classList.add(
            "hidden"
        );

        app.classList.remove(
            "hidden"
        );

        await loadVideos();

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        showLoginError(
            error.message ||
            "Unable to login."
        );

    } finally {

        loggingIn = false;

        loginBtn.disabled =
            false;

        loginLoading.style.display =
            "none";
    }
}


function showLoginError(message) {

    loginError.textContent =
        message;

    loginError.classList.add(
        "show"
    );
}


loginBtn.addEventListener(
    "click",
    login
);


mpinInput.addEventListener(
    "input",
    function() {

        this.value =
            this.value
                .replace(/\D/g, "")
                .slice(0, 6);

        loginError.classList.remove(
            "show"
        );
    }
);


mpinInput.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter"
        ) {
            login();
        }
    }
);


/* LOAD VIDEOS */

async function loadVideos() {

    if (loadingVideos) {
        return;
    }

    loadingVideos = true;

    loading.style.display =
        "flex";

    errorMessage.classList.remove(
        "show"
    );

    try {

        const token =
            getSessionToken();

        if (!token) {

            clearSession();

            return;
        }

        const url =
            EDGE_URL +
            "/videos" +
            "?collectionId=" +
            encodeURIComponent(
                COLLECTION_ID
            ) +
            "&page=1" +
            "&itemsPerPage=100";

        const response =
            await fetch(
                url,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            "Bearer " +
                            token
                    },

                    cache: "no-store"
                }
            );

        const text =
            await response.text();

        let data;

        try {

            data =
                JSON.parse(text);

        } catch (error) {

            throw new Error(
                "Invalid server response"
            );
        }

        if (
            response.status === 401
        ) {

            clearSession();

            showLoginError(
                "Your session has expired. Please login again."
            );

            return;
        }

        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to load videos"
            );
        }

        if (
            !data.items ||
            !Array.isArray(data.items)
        ) {

            throw new Error(
                "No videos found"
            );
        }

        videos =
            data.items;

        filteredVideos =
            [...videos];

        updateCount();

        renderVideos();

        if (
            videos.length > 0
        ) {

            selectVideo(
                videos[0]
            );
        }

    } catch (error) {

        console.error(
            "Video loading error:",
            error
        );

        errorMessage.textContent =
            error.message ||
            "Unable to load videos.";

        errorMessage.classList.add(
            "show"
        );

    } finally {

        loadingVideos = false;

        loading.style.display =
            "none";
    }
}


/* RENDER */

function renderVideos() {

    videoGallery.innerHTML =
        "";

    if (
        filteredVideos.length === 0
    ) {

        videoGallery.innerHTML =
            "<div style='grid-column:1/-1;text-align:center;padding:40px;color:#777;'>No videos found</div>";

        return;
    }

    filteredVideos.forEach(
        function(video) {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "video-card";

            card.dataset.guid =
                video.guid;


            const thumbnailContainer =
                document.createElement(
                    "div"
                );

            thumbnailContainer.className =
                "thumbnail-container";


            const image =
                document.createElement(
                    "img"
                );

            image.className =
                "thumbnail";

            image.loading =
                "lazy";

            image.alt =
                video.title ||
                "Video";

            image.src =
                video.thumbnailUrl ||
                "";


            image.onerror =
                function() {

                    this.style.display =
                        "none";
                };


            const duration =
                document.createElement(
                    "span"
                );

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
                duration
            );


            const title =
                document.createElement(
                    "div"
                );

            title.className =
                "card-title";

            title.textContent =
                video.title ||
                "Untitled";


            card.appendChild(
                thumbnailContainer
            );

            card.appendChild(
                title
            );


            card.addEventListener(
                "click",
                function() {

                    selectVideo(
                        video
                    );
                }
            );


            videoGallery.appendChild(
                card
            );
        }
    );
}


/* SELECT VIDEO */

function selectVideo(video) {

    selectedVideo =
        video;

    document
        .querySelectorAll(
            ".video-card"
        )
        .forEach(
            function(card) {

                card.classList.remove(
                    "active"
                );

                if (
                    card.dataset.guid ===
                    video.guid
                ) {

                    card.classList.add(
                        "active"
                    );
                }
            }
        );


    videoTitle.textContent =
        video.title ||
        "Untitled";


    videoDetails.textContent =
        formatDuration(
            video.length
        ) +
        " • " +
        (video.views || 0) +
        " views";


    playerLoading.classList.add(
        "show"
    );


    const videoUrl =
        getVideoUrl(video);


    videoPlayer.pause();

    videoPlayer.removeAttribute(
        "src"
    );

    videoPlayer.load();

    videoPlayer.src =
        videoUrl;

    videoPlayer.load();


    videoPlayer.onloadeddata =
        function() {

            playerLoading.classList.remove(
                "show"
            );
        };


    videoPlayer.onerror =
        function() {

            playerLoading.classList.remove(
                "show"
            );

            console.error(
                "Unable to play:",
                videoUrl
            );
        };


    document
        .getElementById(
            "playerPanel"
        )
        .scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
}


/* VIDEO URL */

function getVideoUrl(video) {

    if (
        !video.thumbnailUrl ||
        !video.guid
    ) {

        return "";
    }

    const thumbnailUrl =
        new URL(
            video.thumbnailUrl
        );

    const hostname =
        thumbnailUrl.hostname;

    return (
        "https://" +
        hostname +
        "/" +
        video.guid +
        "/play_720p.mp4"
    );
}


/* SEARCH */

function searchVideos() {

    const keyword =
        searchInput.value
            .trim()
            .toLowerCase();

    if (!keyword) {

        filteredVideos =
            [...videos];

    } else {

        filteredVideos =
            videos.filter(
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
    }

    updateCount();
    renderVideos();
}


searchInput.addEventListener(
    "input",
    searchVideos
);


searchBtn.addEventListener(
    "click",
    searchVideos
);


/* CATEGORIES */

document
    .querySelectorAll(
        ".category"
    )
    .forEach(
        function(button) {

            button.addEventListener(
                "click",
                function() {

                    document
                        .querySelectorAll(
                            ".category"
                        )
                        .forEach(
                            function(item) {

                                item.classList.remove(
                                    "active"
                                );
                            }
                        );


                    button.classList.add(
                        "active"
                    );


                    const category =
                        button.dataset.category;


                    if (
                        category === "all"
                    ) {

                        filteredVideos =
                            [...videos];

                    } else if (
                        category === "latest"
                    ) {

                        filteredVideos =
                            [...videos].sort(
                                function(a, b) {

                                    return (
                                        new Date(
                                            b.dateUploaded
                                        ) -
                                        new Date(
                                            a.dateUploaded
                                        )
                                    );
                                }
                            );

                    } else if (
                        category === "popular"
                    ) {

                        filteredVideos =
                            [...videos].sort(
                                function(a, b) {

                                    return (
                                        (b.views || 0) -
                                        (a.views || 0)
                                    );
                                }
                            );

                    } else if (
                        category === "long"
                    ) {

                        filteredVideos =
                            videos.filter(
                                function(video) {

                                    return (
                                        Number(
                                            video.length
                                        ) >= 600
                                    );
                                }
                            );

                    } else if (
                        category === "short"
                    ) {

                        filteredVideos =
                            videos.filter(
                                function(video) {

                                    return (
                                        Number(
                                            video.length
                                        ) < 600
                                    );
                                }
                            );
                    }

                    updateCount();
                    renderVideos();
                }
            );
        }
    );


/* COUNT */

function updateCount() {

    videoCount.textContent =
        filteredVideos.length +
        (
            filteredVideos.length === 1
                ? " video"
                : " videos"
        );
}


/* DURATION */

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


/* HOME */

homeBtn.addEventListener(
    "click",
    function() {

        searchInput.value =
            "";

        filteredVideos =
            [...videos];


        document
            .querySelectorAll(
                ".category"
            )
            .forEach(
                function(item) {

                    item.classList.remove(
                        "active"
                    );
                }
            );


        const allButton =
            document.querySelector(
                '[data-category="all"]'
            );


        if (allButton) {

            allButton.classList.add(
                "active"
            );
        }


        updateCount();

        renderVideos();


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
);


/* START */

async function startApp() {

    const token =
        getSessionToken();


    if (!token) {

        loginScreen.classList.remove(
            "hidden"
        );

        app.classList.add(
            "hidden"
        );

        setTimeout(
            function() {

                mpinInput.focus();

            },
            100
        );

        return;
    }


    loginScreen.classList.add(
        "hidden"
    );

    app.classList.remove(
        "hidden"
    );


    await loadVideos();
}


startApp();
