import React, { useState } from 'react';
import axios from 'axios';

function Search() {
    const [tag, setTag] = useState("");
    const [posts, setPosts] = useState(new Map());
    const [pageNumber, setPageNumber] = useState(1);
    const [loading, setLoading] = useState(true);


    const NGROK_URL = "ad0e-103-212-145-4";

    const onFormSubmit = async (e) => {
        e.preventDefault();
        // to prevent refresh
    }


    const fetchLatestPostsUrls = async () => {
        setPosts(new Map());
        setLoading(true);
        for (let i = 0; i < 10; i++) {
            let post = {
                id: i,
                title: "pending"
            };

            setPosts(posts => new Map(posts.set(post.id, post)));
        }

        let response = await axios.get(`http://${NGROK_URL}.ngrok.io/search/${tag}`, {
            crossDomain: true,
        });

        const post_urls = response.data.post_urls
        // display crawling in frontend for length of posts
        setPosts(new Map());
        for (let i = 0; i < post_urls.length; i++) {
            let post = {
                id: post_urls[i].split("-").at(-1),
                title: "crawling"
            };

            setPosts(posts => new Map(posts.set(post.id, post)));
        }
        fetchPosts(post_urls);
    }

    const fetchMorePostsUrls = async () => {
        setPageNumber(pageNumber + 1);
        setLoading(true);
        let tempOldPosts = posts;
        for (let i = 0; i < 10; i++) {
            let post = {
                id: i,
                title: "pending"
            };

            setPosts(posts => new Map(posts.set(post.id, post)));
        }

        let response = await axios.get(`http://${NGROK_URL}.ngrok.io/load_more_posts/${tag}/${pageNumber}`, {
            crossDomain: true,
        });

        const post_urls = response.data
        setPosts(new Map());
        setPosts(tempOldPosts);
        // display crawling in frontend for length of posts
        for (let i = 0; i < post_urls.length; i++) {
            let post = {
                id: post_urls[i].split("-").at(-1),
                title: "crawling"
            };

            setPosts(posts => new Map(posts.set(post.id, post)));
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
            setPosts(posts => new Map(posts.set(post.id, post)));
        }
        newSocket.addEventListener('close', (_) => {
            setLoading(false);
        });
    }

    return (
        <form onSubmit={onFormSubmit}>
            <br />
            <input type="text" onChange={(e) => { setTag(e.target.value) }} value={tag} />
            <button onClick={async () => {
                await fetchLatestPostsUrls();
            }}> Send </button>
            <br />
            {[...posts.keys()].map(k =>
                <div key={k}>
                    <br />
                    {posts.get(k).title}
                    <br />
                </div >
            )}
            <br />
            {!loading ? <button onClick={async () => {
                await fetchMorePostsUrls();
            }}> Load more </button> : <br />}
            <br />
        </form>
    )
}

export default Search;