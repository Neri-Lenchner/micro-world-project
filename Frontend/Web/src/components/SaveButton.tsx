import { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../auth/auth";
import { useWatchlist } from "../watchlist/WatchlistContext";

export default function SaveButton({ productId, className = "" }: { productId: number; className?: string }) {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const { isSaved, toggle } = useWatchlist();
  const saved = isSaved(productId);

  function handleClick(event: MouseEvent) {
    // ProductCard renders this next to a <Link>; stop it from also triggering navigation.
    event.preventDefault();
    event.stopPropagation();
    if (!user) {
      navigate(`/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    toggle(productId);
  }

  return (
    <button type="button" className={`secondary ${className}`.trim()} onClick={handleClick}>
      {saved ? "Saved" : "Save"}
    </button>
  );
}
