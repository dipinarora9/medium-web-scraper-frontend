import React from 'react'
import { withRouter } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Tags from './Tags';

function Post({ post, openPost }) {

    return (
        <div key={post.id}>
            <br />
            <Link
                to={{
                    pathname: "/post/" + post.id,
                }}
                target="_blank"
                onClick={() => openPost(post)}
            >{post.title}</Link>
            {post?.tags !== undefined ?
                <div>
                    <div>{"Author: " + post?.creator?.name}</div>
                    <div>{"Responses count " + post?.responses_count}</div>
                    <div>{"Claps count " + post?.claps_count}</div>
                    <div>{"Crawl time " + post?.time_taken_to_crawl}</div>
                    <Tags key={"post_tags_" + post.id} title="Tags" tags={post?.tags} removeBreakes={true} ></Tags>
                </div>
                : <div></div>}
        </div >
    )
}

export default withRouter(Post);