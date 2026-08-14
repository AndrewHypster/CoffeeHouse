import s from "./avatar.module.css";
import Image from "next/image";

const Avatar = ({ avatar, type, className }) => {
  if (!avatar)
    return (
      <div className={className? className : s.avatar}>
        <p className={s.smile}>👨🏼‍🦲</p>
      </div>
    );

  if (type == "smile")
    return (
      <div className={className? className : s.avatar}>
        <p className={s.smile}>{avatar}</p>
      </div>
    );

  if (type == "img")
    return (
      <div className={className? className : s.avatar}>
        <Image className={s.img} src={avatar} width={64} height={64} />
      </div>
    );

  return null;
};

export default Avatar;
