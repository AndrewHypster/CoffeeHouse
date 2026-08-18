"use client";

import Avatar from "@/components/avatar";
import s from "./leaders.module.css";
import Loader from "@/components/loader";
import { useEffect, useState } from "react";
import { Crown, Heart, Trophy } from "lucide-react";
import Link from "next/link";

const LeadTable = ({ title, leaders, value }) => {
  const topLeaders = leaders.slice(0, 3);
  const otherLeaders = leaders.slice(3);

  return (
    <section className={s.tableSection}>
      <h2 className={s.tableTitle}>Рейтинг {title}</h2>

      <div className={s.table}>
        <ol className={s.tableTop}>
          {topLeaders.map((leader) => (
            <li className={s.topLeader} key={leader.id}>
              <Link href={`/profile/${leader.id}`}>
              
              <div className="relative">
                <Avatar
                  className={s.avatar}
                  avatar={leader.avatar}
                  type={leader.avatar_type}
                >
                  <Trophy className={s.trophy} />
                </Avatar>
              </div>

              <div className={s.info}>
                <strong>{leader.name}</strong>
                <p>
                  <small>
                    {title}: <b className="text-[1rem]">{leader[value]}</b>
                  </small>
                </p>
              </div></Link>
            </li>
          ))}
        </ol>

        <ol className={s.others}>
          <li>
              <div className={s.other}>
                <span className="center">№</span>
                <p>аватар</p>
                <span className={s.name}>Ім'я</span>
                <Heart className="w-[1rem] mx-[auto] block" />
              </div>
            </li>
          {otherLeaders.map((leader, i) => (
            
            <li key={leader.id}>
              <Link className={s.other} href={`/profile/${leader.id}`}>
                <span>{i + 4}</span>
                <Avatar className="mx-[auto] text-[1.5rem]" avatar={leader.avatar} type={leader.avatar_type} />
                <span className={s.name}>{leader.name}</span>
                <span>{leader[value]}</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

const Leaders = () => {
  const [isLoading, setLoading] = useState(true);
  const [rating, setRating] = useState(false);

  useEffect(() => {
    const getRating = async () => {
      try {
        const resLikes = await fetch("/api/db/rating?type=likes");
        const likes = await resLikes.json();

        const resPoems = await fetch("/api/db/rating?type=poems");
        const poems = await resPoems.json();

        setRating({ likes, poems });
      } catch {
        setRating("Error");
      } finally {
        setLoading(false);
      }
    };

    getRating();
  }, []);

  if (isLoading) return <Loader />;
  else if (rating == "Error") return <h1>Error 500</h1>;
  else
    return (
      <div className={s.content}>
        <LeadTable title="Лайків" leaders={rating.likes} value="likes" />
        <LeadTable title="Віршів" leaders={rating.poems} value="poems" />
      </div>
    );
};

export default Leaders;
