import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './search.css';

const DEBUG = false;

function Search() {
    const [tag, setTag] = useState("");
    const [posts, setPosts] = useState(new Map());
    const [historyTags, setHistoryTags] = useState([]);
    const [suggestedTags, setSuggestedTags] = useState([]);
    const [typo, setTypo] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [loading, setLoading] = useState(true);

    const BACKEND_URL = DEBUG ? "52ae-103-48-197-134.ngrok.io" : "medium-web-scraper.herokuapp.com";

    useEffect(() => {
        let searchHistory = localStorage.getItem('searchHistory');

        if (searchHistory) {
            setHistoryTags(JSON.parse(searchHistory));
        }

        if (window.location.href.endsWith("#")) return;
        let t = window.location.href.split('/').at(-1);
        setTag(t);
        document.getElementById("tag_field").value = t;
    }, []);

    const onFormSubmit = async (e) => {
        // to prevent refresh
        e.preventDefault();
    }


    const fetchLatestPostsUrls = async (tagValue) => {
        var recursionAllowed = true;
        if (tagValue !== undefined) {
            recursionAllowed = false;
        } else {
            tagValue = tag;
        }
        setPosts(new Map());
        setLoading(true);
        setSuggestedTags([]);
        saveTag(tagValue);

        for (let i = 0; i < 10; i++) {
            let post = {
                id: i,
                title: "pending"
            };

            setPosts(posts => new Map(posts.set(post.id, post)));
        }
        console.log("fetching latest posts for " + tagValue);

        let response = await axios.get(`https://${BACKEND_URL}/search/${tagValue}`, {
            crossDomain: true,
        });

        const post_urls = response.data.post_urls
        setSuggestedTags(response.data.related_tags.slice(0, 10));

        // display crawling in frontend for length of posts
        setPosts(new Map());
        for (let i = 0; i < post_urls.length; i++) {
            let post = {
                id: post_urls[i].split("-").at(-1),
                title: "crawling"
            };

            setPosts(posts => new Map(posts.set(post.id, post)));
        }
        if (post_urls.length > 0) {
            fetchPosts(post_urls);
        } else if (recursionAllowed) {
            fetchTypo().then((correct_word) => {
                setTag(correct_word);
                setTypo(tag);
                fetchLatestPostsUrls(correct_word);
            });
        }
    }

    const fetchTypo = async () => {
        // base case to prevent recursive calls to backend
        if (typo === tag) return;

        setTypo(null);
        let response = await axios.get(`https://${BACKEND_URL}/typo_check/${tag}`, {
            crossDomain: true,
        });

        const correct_word = response.data;

        return correct_word;
    }

    const fetchMorePostsUrls = async () => {
        if (pageNumber > 2) return;
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

        let response = await axios.get(`https://${BACKEND_URL}/load_more_posts/${tag}/${pageNumber}`, {
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
        if (post_urls.length > 0) {
            fetchPosts(post_urls);
        }
    }

    const fetchPosts = async (postUrls) => {
        const newSocket = new WebSocket(`wss://${BACKEND_URL}/crawl`);
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


    const openPost = (post) => {
        localStorage.setItem('post', JSON.stringify(post));
    }


    const saveTag = (t) => {
        if (!historyTags.includes(t)) {
            localStorage.setItem('searchHistory', JSON.stringify([t, ...historyTags]));
            setHistoryTags(historyTags => [t, ...historyTags]);
        }
    }

    return (
        <form onSubmit={onFormSubmit}>
            <br />
            <input type="text" id="tag_field"
                onChange={(e) => { setTag(e.target.value) }} />
            <button onClick={async () => {
                await fetchLatestPostsUrls();
            }}> Send </button>
            <br />
            {typo !== null ? <div>
                <br />
                <div>Showing results for {tag}. Instead of {typo}</div><br />
            </div> : <div></div>
            }
            {suggestedTags.length > 0 ? <div>Suggested tags</div> : <div></div>}
            {
                suggestedTags.map((tag) => {
                    return (
                        <Link
                            to={{
                                pathname: "/search/" + tag,
                            }}
                            key={tag} className="tags" target="_blank"
                        >{tag}</Link>
                    )
                })
            }
            {
                posts.size === 0 ? <div>
                    {historyTags.length > 0 ?
                        <div>Previous searches</div> : <div></div>}
                    {historyTags.map((tag) => {
                        return (
                            <Link
                                to={{
                                    pathname: "/search/" + tag,
                                }}
                                target="_blank"
                                key={tag} className="tags"
                            >{tag}</Link>
                        )
                    })}</div> : <div></div>
            }
            {
                posts.size > 0 ? [...posts.keys()].map(k =>
                    <div key={k}>
                        <br />
                        <Link
                            to={{
                                pathname: "/post/" + k,
                            }}
                            target="_blank"
                            onClick={() => openPost(posts.get(k))}
                        >{posts.get(k).title}</Link>
                        {posts.get(k)?.tags !== undefined ?
                            <div>
                                <div>{"Author: " + posts.get(k)?.creator?.name}</div>
                                <div>{"Responses count " + posts.get(k)?.responses_count}</div>
                                <div>{"Claps count " + posts.get(k)?.claps_count}</div>
                                <div>{posts.get(k)?.tags?.join(", ")}</div>
                            </div>
                            : <div></div>}
                    </div >
                ) : <div></div>
            }
            <br />
            {
                !loading && pageNumber < 3 ? <button onClick={async () => {
                    await fetchMorePostsUrls();
                }}> Load more </button> : <br />
            }
            <br />
        </form >
    )
}

export default Search;