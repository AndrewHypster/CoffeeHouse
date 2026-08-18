import s from "./avatar.module.css";
import Image from "next/image";

const Avatar = ({ avatar, type, className, children=<></> }) => {
  if (!avatar)
    return (
      <div className={className? className : s.avatar}>
        <p className={s.smile}>👨🏼‍🦲</p>
        {children}
      </div>
    );

  if (type == "smile")
    return (
      <div className={className? className : s.avatar}>
        <p className={s.smile}>{avatar}</p>
        {children}
      </div>
    );

  if (type == "img")
    return (
      <div className={className? className : s.avatar}>
        <Image className={s.img} src={avatar} width={64} height={64} />
        {children}
      </div>
    );

  return null;
};

export default Avatar;
