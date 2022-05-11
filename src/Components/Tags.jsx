import React from 'react'
import { withRouter } from 'react-router-dom';
import { Link } from 'react-router-dom';

function Tags({ title, tags, removeBreakes }) {

    return (
        tags && tags.length > 0 ? <div>
            {removeBreakes ? <div></div> : <br />}
            <div>{title}</div>
            {
                tags.map((tag) => {
                    return (
                        <Link
                            to={{
                                pathname: "/search/" + tag,
                            }}
                            target="_blank"
                            key={title + "_" + tag} className="tags"
                        >{tag}</Link>
                    )
                })
            }
            {removeBreakes ? <div></div> : <br />}
        </div > : <div></div>
    )
}

export default withRouter(Tags);