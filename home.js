const LIBRARY_ID = "752623";

const COLLECTION_ID =
    "257764af-3ad3-4d82-ad22-5ea2e96ae9a4";

const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbxShASJqp3wwSPfT2ELl_wndaX0UYJWzn7ZUffdZFhBHt4mDlR6ra0bidPRpIiZqZcK/exec";


async function loadVideos() {

    const gallery =
        document.getElementById("videoGallery");

    gallery.innerHTML = `
        <div class="loading">
            Loading videos...
        </div>
    `;

    try {

        const url =
            SCRIPT_URL +
            "?collection=" +
            encodeURIComponent(COLLECTION_ID);

        console.log("Request:", url);

        const response = await fetch(url, {
            method: "GET",
            cache: "no-store"
        });

        const text =
            await response.text();

        console.log("Response:", text);

        if (!response.ok) {

            throw new Error(
                "Google Script Error: " +
                response.status
            );

        }

        const data =
            JSON.parse(text);

        if (!data.success) {

            throw new Error(
                data.error ||
                "Hindi makuha ang videos."
            );

        }

        gallery.innerHTML = "";

        if (!data.items || data.items.length === 0) {

            gallery.innerHTML = `
                <div class="empty">
                    Walang video sa collection.
                </div>
            `;

            return;
        }

        data.items.forEach(video => {

            const card =
                document.createElement("div");

            card.className =
                "video-card";

            const thumbnail =
                video.thumbnailUrl ||
                video.thumbnailURL ||
                "";

            card.innerHTML = `

                <div class="thumbnail-box">

                    ${
                        thumbnail
                        ?
                        `<img
                            src="${thumbnail}"
                            alt="${escapeHTML(video.title)}"
                            loading="lazy"
                        >`
                        :
                        `<div class="no-thumbnail">
                            No Thumbnail
                        </div>`
                    }

                </div>

                <div class="video-title">
                    ${escapeHTML(video.title)}
                </div>

            `;

            card.onclick = function() {
                openVideo(video.guid);
            };

            gallery.appendChild(card);

        });

    } catch (error) {

        console.error(error);

        gallery.innerHTML = `

            <div class="error">

                ❌ Hindi makuha ang videos.

                <br><br>

                ${escapeHTML(error.message)}

            </div>

        `;

    }

}


function openVideo(videoId) {

    const playerBox =
        document.getElementById("playerBox");

    const player =
        document.getElementById("videoPlayer");

    player.src =
        "https://player.mediadelivery.net/embed/" +
        LIBRARY_ID +
        "/" +
        videoId;

    playerBox.style.display = "flex";

}


function closeVideo() {

    document.getElementById("videoPlayer").src = "";

    document.getElementById("playerBox")
        .style.display = "none";

}


function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text || "";

    return div.innerHTML;

}


document.addEventListener(
    "DOMContentLoaded",
    loadVideos
);
