import React, { useEffect, useState } from 'react'
import { withRouter } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './postpage.css';

function PostPage() {
    const [post, setPost] = useState(null);

    useEffect(() => {
        let localStorageData = JSON.parse(localStorage.getItem('post'));
        setPost(localStorageData);
    }, []);

    return (
        <div>
            <div>
                {post == null ? <div></div> : <h1>{post.title}</h1>}
                {post == null || post.paragraphs === [] || post.paragraphs === undefined ?
                    <div>No Data</div> :
                    post.paragraphs.map((paragraph) =>
                        <div dangerouslySetInnerHTML={{ __html: paragraph }} />
                    )}
                {post == null || post.tags === undefined || post.tags === [] ?
                    <div></div> :
                    <div>
                        <br />
                        <h4> Related Topics </h4>
                        <div >
                            {post.tags.map((tag) => {
                                return (
                                    <Link
                                        to={{
                                            pathname: "/search/" + tag,
                                        }}
                                        key={tag} className="related-tags"
                                        target="_blank"
                                    >{tag}</Link>
                                )
                            })}
                        </div>
                    </div>}
            </div>

        </div >
    )
    // <a key={tag} className="related-tags" href={"/search/" + tag} >

    // </a>
}

export default withRouter(PostPage);