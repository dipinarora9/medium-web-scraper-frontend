import React from 'react'
import { withRouter } from 'react-router-dom';

function PostPage() {
    const { post } = this.props.location;
    
    return (
        <div className="article-container">
            <div>
                <h1>{post.title}</h1>
                {post.paragraphs === [] || post.paragraphs === undefined ?
                    <div>No Data</div> :
                    post.paragraphs.map((paragraph) => {
                        return paragraph
                    })}
                {post.tags === undefined || post.tags === [] ?
                    <div></div> :
                    <div>
                        <div className="heading"> Related Topics </div>
                        <div className="related-tags-list">
                            {post.tags.map((tag) => {
                                return (<div className="related-tags">
                                    {tag}
                                </div>)
                            })}
                        </div>
                    </div>}
            </div>

        </div>
    )
}

export default withRouter(PostPage);