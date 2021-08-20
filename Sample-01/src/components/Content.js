import React, { Component } from "react";

import { Row, Col } from "reactstrap";

import contentData from "../utils/contentData";

class Content extends Component {
  render() {
    return (
      <div className="next-steps my-5">
        <h2 className="my-5 text-center">Which one would you like?</h2>
        <Row className="d-flex justify-content-between">
          {contentData.map((col, i) => (
            <Col key={i} md={5} className="mb-4">
              <Col>
                <img src={col.image} width="240"/>
              </Col>
              <Col>
                <h3 className="mb-3">
                  {col.name}
                </h3>
                <p>{col.description}</p>
              </Col>
            </Col>
          ))}
        </Row>
      </div>
    );
  }
}

export default Content;
