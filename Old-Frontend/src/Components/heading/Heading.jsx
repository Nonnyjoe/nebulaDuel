import React from 'react';
import "./heading.css"

const Heading = ({description, title_1, title}) => {
  return (
    <>
        <div className="heading">
            <h5>{description}</h5>
            <h2>{title}</h2>
            {title_1 && <h6>{title_1}</h6>}
        </div>
    </>
  )
}

export default Heading