import s from "./avatar.module.css";
import Image from "next/image";

const Avatar = ({ avatar, type }) => {
  console.log(avatar, type)
  if (!avatar)
    return (
      <div className={s.avatar}>
        {!avatar ? <p className={s.smile}>👨🏼‍🦲</p> : ""}
      </div>
    );
  else if (type == "smile")
    return (
      <div className={s.avatar}>
        <p className={s.smile}>{avatar}</p>
      </div>
    );
  else if (type == "img")
    return (
      <div className={s.avatar}>
        <Image className={s.img} src={avatar} width={64} height={64} />
      </div>
    );
  else return;
};

export default Avatar;
