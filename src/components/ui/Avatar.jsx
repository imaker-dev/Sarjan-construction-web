
import React from "react";

const DICEBEAR_URL = "https://api.dicebear.com/9.x/initials/png";

const Avatar = ({
  name = "User",
  src,
  size = 40,
  alt,
  className = "",
  style,
  ...props
}) => {
  const avatarUrl =
    src ||
    `${DICEBEAR_URL}?seed=${encodeURIComponent(name)}&backgroundType=solid`;

  return (
    <img
      src={avatarUrl}
      alt={alt || `${name} avatar`}
      width={size}
      height={size}
      className={className}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: "50%",
        objectFit: "cover",
        display: "block",
        ...style,
      }}
      {...props}
    />
  );
};

export default Avatar;
