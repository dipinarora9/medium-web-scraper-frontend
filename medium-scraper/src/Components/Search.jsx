import React, { useState } from 'react';
import axios from 'axios';

function Search() {
    const [tag, setTag] = useState("");
    const [posts, setPosts] = useState([]);
    let crawledPostsCount = -1;

    const NGROK_URL = "218d-103-48-197-159";

    const onFormSubmit = async (e) => {
        e.preventDefault(); // to prevent refresh
    }


    const fetchPostsUrls = async () => {
        setPosts([]);
        console.log("request sent");
        crawledPostsCount = -1;
        let response = await axios.get(`http://${NGROK_URL}.ngrok.io/search/${tag}`, {
            crossDomain: true,
        });
        console.log(response.data);
        const post_urls = response.data.post_urls
        // display crawling in frontend for length of posts
        for (let i = 0; i < post_urls.length; i++) {
            let post = {
                id: i,
                title: "crawling"
            };
            setPosts(posts => [...posts, post]);

        }
        fetchPosts(post_urls);
    }

    const fetchPosts = async (postUrls) => {
        const newSocket = new WebSocket(`ws://${NGROK_URL}.ngrok.io/crawl`);
        newSocket.addEventListener('open', (_) => {
            newSocket.send(JSON.stringify(postUrls));
        });

        newSocket.onmessage = message => {
            const post = JSON.parse(message.data);

            setPosts(posts => {
                posts[crawledPostsCount] = post;
                return [...posts]
            });
            crawledPostsCount++;
        }
    }

    return (
        <form onSubmit={onFormSubmit}>
            <br />
            <input type="text" onChange={(e) => { setTag(e.target.value) }} value={tag} />
            <button onClick={async () => {
                await fetchPostsUrls();
            }}> Send </button>
            <br />

            {posts.map((post) =>
                <div key={post.id}>
                    <br />
                    {post.title}
                    <br />
                </div >
            )}
        </form>
    )
}

export default Search;