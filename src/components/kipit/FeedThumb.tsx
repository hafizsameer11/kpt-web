import { feedArt } from "@/components/kipit/art";
import { cn } from "@/lib/utils";

/** Abstract brand artwork thumbnail for "For you" content cards. */
export function FeedThumb({
  index,
  className,
}: {
  index: number;
  className?: string;
}) {
  return (
    <img
      src={feedArt(index)}
      alt=""
      aria-hidden="true"
      loading="lazy"
      width={1024}
      height={640}
      className={cn("mb-3 h-28 w-full rounded-2xl object-cover", className)}
    />
  );
}
