import React from "react";
import PropTypes from "prop-types";
import "./tooltip.css";

const ToolTip = ({
  link,
  title,
  cornerText,
  cornerTextColor,
  children,
  onMouseEnter,
  onMouseLeave
}) => (
  <div
    className="tooltip"
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    <div className="top-info">
      <div className="top-title">{title}</div>
      <div className="corner-text" style={{ color: cornerTextColor }}>
        {cornerText}
      </div>
    </div>
    <div className="info-body">
      {children}
      <br />
      <a href={link} target="_blank" rel="noopener noreferrer">
        <div className="learn-more">
          Learn More
          <img alt="link-icon" className="icon" src="/link-icon.svg" />
        </div>
      </a>
    </div>
  </div>
);

ToolTip.propTypes = {
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  cornerText: PropTypes.string,
  cornerTextColor: PropTypes.string,
  title: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]).isRequired
};

ToolTip.defaultProps = {
  onMouseEnter: () => {},
  onMouseLeave: () => {},
  cornerTextColor: "#263A4f",
  cornerText: ""
};

export default ToolTip;
