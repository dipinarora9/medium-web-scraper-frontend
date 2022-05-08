import React, { useState } from 'react';
import axios from 'axios';

function Search() {
    const [tag, setTag] = useState("");
    const [posts, setPosts] = useState([]);


    const onFormSubmit = async (e) => {
        e.preventDefault(); // to prevent refresh
    }


    const fetchPostsUrls = async () => {

        let response = await axios.get(`http://8064-103-48-197-159.ngrok.io/search/${tag}`, {
            crossDomain: true,
        });
        console.log(response.body);
    }

    const fetchPosts = async (postUrls) => {
        setPosts([]);
        const newSocket = new WebSocket(`ws://6c3c-103-48-197-159.ngrok.io/crawl`);
        newSocket.send(postUrls);
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