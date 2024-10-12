type colorType =
  | "danger"
  | "success"
  | "default"
  | "warning"
  | "primary"
  | "secondary";
  
type sizeType = "md" | "sm" | "lg";

interface uniformProps {
  size?: sizeType;
  radius?: sizeType;
  color?: colorType;
}

export const uniformStyle = ({
  size = "sm",
  radius = "sm",
  color = "primary",
}: uniformProps = {}) => {
  return {
    size: size,
    radius: radius,
    color: color,
  };
};
