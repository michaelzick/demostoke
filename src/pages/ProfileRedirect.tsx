import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/helpers";
import { slugify } from "@/utils/slugify";

const ProfileRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user?.name) {
      navigate(`/user-profile/${slugify(user.name)}`, { replace: true });
    } else {
      navigate("/auth/signin", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  return null;
};

export default ProfileRedirect;
