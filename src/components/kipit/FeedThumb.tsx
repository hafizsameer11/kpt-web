import { articleArt } from "@/components/kipit/art";
import { cn } from "@/lib/utils";

/** Abstract brand artwork thumbnail for "For you" content cards. */
export function FeedThumb({
  index,
  id,
  className,
}: {
  index: number;
  id?: string;
  className?: string;
}) {
  return (
    <img
      src={articleArt(id ?? "", index)}
      alt=""
      aria-hidden="true"
      loading="lazy"
      width={1024}
      height={640}
      className={cn("mb-3 h-28 w-full rounded-xl object-cover", className)}
    />
  );
}
