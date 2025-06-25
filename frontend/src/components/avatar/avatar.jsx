import { createAvatar } from "@dicebear/core";
import { identicon } from "@dicebear/collection";

export const Avatar = ({ username, size }) => {
  const avatar = createAvatar(identicon, {
    size: 64,
    seed: username,
  }).toDataUri();
  return (
    <img
      src={avatar}
      alt={username}
      width={size}
      height={size}
      className="rounded-full bg-white"
    />
  );
};