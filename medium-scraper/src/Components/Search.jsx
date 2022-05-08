import React, { useState } from 'react';
import axios from 'axios';

function Search() {
    const [tag, setTag] = useState("");
    const [posts, setPosts] = useState([]);
    const NGROK_URL = "f17b-103-48-197-159";

    const onFormSubmit = async (e) => {
        e.preventDefault(); // to prevent refresh
    }


    const fetchPostsUrls = async () => {

        let response = await axios.get(`http://${NGROK_URL}.ngrok.io/search/${tag}`, {
            crossDomain: true,
        });
        console.log(response.data);
        const post_urls = response.data.post_urls
        // display crawling in frontend for length of posts
        for (let i = 0; i < post_urls.length; i++) {
            console.log(post_urls[i]);
            let post = { id: post_urls[i].split("-").at(-1), title: "crawling" };
            console.log(post);
            setPosts(posts => [...posts, post]);
        }
        fetchPosts(post_urls);
    }

    const fetchPosts = async (postUrls) => {
        setPosts([]);

        const newSocket = new WebSocket(`ws://${NGROK_URL}.ngrok.io/crawl`);
        newSocket.addEventListener('open', (_) => {
            newSocket.send(JSON.stringify(postUrls));
        });
        newSocket.onmessage = message => {
            const post = JSON.parse(message.data);
            setPosts(posts => [...posts, post]);
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
                </div>
            )}
        </form>
    )
}

export default Search;