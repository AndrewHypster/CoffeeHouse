import ProfileContent from "@/components/profile/profile-content";

export default async function UserProfilePage({ params }) {
  const { id } = await params;
  const userId = Number(id);
  if (!Number.isInteger(userId) || userId <= -2) {
    return <div>Користувача не знайдено</div>;
  }
  return <ProfileContent userId={userId} />;
}