(function () {
    window.podcasts = [];
    const amountOfPosts = 8,
        siteUrl = "https://www.productmomentum.fm",
        baseApiUrl = siteUrl + "/wp-json/wp/v2/",
        postsApiUrl = "posts?per_page=" + amountOfPosts,
        $feedWrapper = jQuery("#podcast-feed");

    jQuery(document).ready(function () {
        if ($feedWrapper.length > 0) {
            const $ = jQuery,
                $container = $('<div class="container" />'),
                $feedContainer = $('<div class="feed-container">'),
                $loading = $(
                    '<div class="feed-loading flex-column align-items-center"><b>Loading...</b><div class="lds-ripple"><div></div><div></div></div><div>'
                );

            $feedContainer.css({ opacity: 0, transition: ".5s" });
            $loading.css({
                width: "100%",
                position: "absolute",
                top: "0",
                left: "0",
                display: "flex",
            });

            $container.css({ position: "relative" });
            $container.append($loading);
            $container.append($feedContainer);

            $feedWrapper
                .find(".wp-block-group__inner-container")
                .append($container);

            async function getPosts() {
                const response = await fetch(baseApiUrl + postsApiUrl),
                    postsArray = await response.json();
                let count = 1;

                postsArray.forEach(async function (post) {
                    const imageId = getImageId(post.content.rendered),
                        thumbUrl = await getThumbnail(imageId),
                        episode = post.title.rendered.split(" / ")[0],
                        title = post.title.rendered.split(" / ")[1],
                        postObj = {
                            title,
                            author: getAuthor(post.content.rendered),
                            workPlace: getWorkplace(post.content.rendered),
                            exerpt: post.excerpt.rendered,
                            description: getDescription(post.content.rendered),
                            thumbnail: thumbUrl,
                            episode,
                            link: post.link,
                            id: post.id,
                        };
                    podcasts.push(postObj);

                    if (count === amountOfPosts) {
                        let postsOrdered = podcasts.sort((a, b) =>
                            a.episode < b.episode
                                ? -1
                                : a.episode > b.episode
                                ? 1
                                : 0
                        );

                        addNode(postsOrdered);
                    }

                    count++;
                });
            }

            function getImageId(content) {
                let imageSlug = content.match(/(\bwp-image-\S+\b)/gi);
                return imageSlug[0].split("-")[2];
            }

            function getAuthor(content) {
                return content.match(
                    new RegExp('pm-author-name-pic">' + "(.*)" + "</h3>")
                )[1];
            }

            function getWorkplace(content) {
                return content.match(
                    new RegExp('pm-work-place">' + "(.*)" + "</h5>")
                )[1];
            }

            function getDescription(content) {
                let fullDescription = content.match(
                    new RegExp("<h3>Description</h3>\n" + "(.*)" + "\n<p>")
                )[1];
                let cleanDescription = $(fullDescription).text();
                return cleanDescription.replace(/^(.{90}[^\s]*).*/, "$1");
            }

            async function getThumbnail(id) {
                const response = await fetch(baseApiUrl + "media/" + id),
                    imageObj = await response.json(),
                    imageUrl = imageObj.media_details.sizes.large.source_url;

                return siteUrl + imageUrl;
            }

            function addNode(postsOrdered) {
                let count = 0;
                postsOrdered.map((post, index) => {
                    const $postDom = $(`
                    <div class="feed-node">
                        <figure>
                            <a target="_blank" href="${post.link}">
                            <img src="${post.thumbnail}" alt="Picture of ${post.author}" />
                            </a>
                        </figure>
                        <div class="feed-content">
                            <a target="_blank" href="${post.link}">
                                <h4>Episode ${post.episode}</h4>
                                <p><b>${post.title}</b> featuring ${post.author} (${post.workPlace}). ${post.description}...</p>
                            </a>
                        </div>
                        
                    </div>
                    `);

                    $postDom.find("p a").unwrap();

                    $feedContainer.prepend($postDom);

                    count++;

                    if (count === amountOfPosts) {
                        // $("head").append(
                        //     '<link rel="stylesheet" type="text/css" href="//cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css"/>'
                        // );

                        $feedContainer
                            .find(".feed-content p a")
                            .contents()
                            .unwrap();

                        $feedContainer.on("init", (event, slick) => {
                            $loading.fadeOut();
                            $feedContainer.css("opacity", "1");
                        });

                        setTimeout(function () {
                            $feedContainer.slick({
                                infinite: true,
                                slidesToShow: 2,
                                dots: true,
                                slidesToScroll: 2,
                                arrows: false,
                                responsive: [
                                    {
                                        breakpoint: 1024,
                                        settings: {
                                            slidesToShow: 2,
                                            slidesToScroll: 1,
                                            infinite: false,
                                            dots: true,
                                        },
                                    },
                                    {
                                        breakpoint: 768,
                                        settings: {
                                            slidesToShow: 1,
                                            slidesToScroll: 1,
                                        },
                                    },
                                    // You can unslick at a given breakpoint now by adding:
                                    // settings: "unslick"
                                    // instead of a settings object
                                ],
                            });
                        }, 1000);
                    }
                });
            }

            getPosts();

            // const script = document.createElement("script");
            // script.onload = function () {
            //     //do stuff with the script

            //     getPosts();
            // };
            // script.src =
            //     "https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick.min.js";
            // document.head.appendChild(script);
        } // End of IF
    }); // End of document.ready
})();
