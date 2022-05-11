import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './search.css';
import Tags from './Tags';

const DEBUG = false;

function Search() {
    const [tag, setTag] = useState("");
    const [posts, setPosts] = useState(new Map());
    const [historyTags, setHistoryTags] = useState([]);
    const [suggestedTags, setSuggestedTags] = useState([]);
    const [autocompleteSocket, setAutocompleteSocket] = useState(null);
    const [autoCompleteSuggestionsTags, setAutoCompleteSuggestions] = useState([]);
    const [trendingTags, setTrendingTags] = useState(null);
    const [typo, setTypo] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [loading, setLoading] = useState(true);

    const BACKEND_URL = DEBUG ? "b2f6-103-48-197-134.ngrok.io" : "medium-web-scraper.herokuapp.com";

    const WORDS_BACKEND_URL = DEBUG ? "b2f6-103-48-197-134.ngrok.io" : "medium-web-scraper-c5zky.ondigitalocean.app";

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
        let response = await axios.get(`https://${WORDS_BACKEND_URL}/typo_check/${tag}`, {
            crossDomain: true,
        });

        const correct_word = response.data;

        return correct_word;
    }

    const fetchTrendingTags = useCallback(async () => {
        if (trendingTags) return;
        setTrendingTags([]);

        let response = await axios.get(`https://${BACKEND_URL}/trending_tags`, {
            crossDomain: true,
        });

        const tags = response.data;

        setTrendingTags(_ => [...tags]);
    }, [BACKEND_URL, trendingTags]);

    useEffect(() => {
        fetchTrendingTags();
    }, [fetchTrendingTags]);

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

    const setupAutocompleteSuggestionsSocket = async () => {
        return new Promise((resolve, _) => {
            console.log("CONNECTING");
            const newSocket = new WebSocket(`wss://${WORDS_BACKEND_URL}/auto_complete`);
            newSocket.addEventListener('open', (_) => {
                resolve(newSocket);
            });

            newSocket.onmessage = message => {
                const suggestions = JSON.parse(message.data);
                setAutoCompleteSuggestions(_ => [...suggestions]);
            }
            newSocket.addEventListener('close', (_) => {
                setAutocompleteSocket(null);
            });
        });


    }

    const fetchAutocompleteSuggestions = async (keyword) => {
        if (!autocompleteSocket) {
            const soc = await setupAutocompleteSuggestionsSocket();
            setAutocompleteSocket(soc);
            soc.send(keyword);
        } else
            autocompleteSocket.send(keyword);
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
            <input type="text"
                id="tag_field"
                autoComplete="off"
                onChange={(e) => {
                    setTag(e.target.value);
                    setTypo(null);
                    fetchAutocompleteSuggestions(e.target.value);
                }} />
            <button onClick={async () => {
                await fetchLatestPostsUrls();
            }}> Search </button>
            <br />
            {typo !== null ? <div>
                <br />
                <div>Showing results for {tag}. Instead of {typo}</div><br />
            </div> : <div></div>
            }
            <Tags title="Autocomplete suggestions" tags={autoCompleteSuggestionsTags}></Tags>
            <Tags title="Trending tags" tags={trendingTags}></Tags>
            <Tags title="Suggested tags" tags={suggestedTags}></Tags>
            {
                posts.size === 0 ?
                    <Tags title="Previous Searches" tags={historyTags}></Tags> : <div></div>
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
                                <Tags title="Tags" tags={posts.get(k)?.tags} removeBreakes={true} ></Tags>
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