import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

type SkillSwapLogoProps = {
  className?: string;
  href?: string;
  imageClassName?: string;
  priority?: boolean;
};

function LogoImage({ imageClassName, priority }: { imageClassName?: string; priority: boolean }) {
  return (
    <Image
      priority={priority}
      alt="SkillSwap"
      className={cn("h-auto w-48", imageClassName)}
      height={114}
      src="/skillswap-logo.png"
      width={376}
    />
  );
}

export function SkillSwapLogo({ className, href, imageClassName, priority }: SkillSwapLogoProps) {
  const logo = (
    <LogoImage {...(imageClassName ? { imageClassName } : {})} priority={Boolean(priority)} />
  );

  if (!href) {
    return <div className={cn("flex items-center", className)}>{logo}</div>;
  }

  return (
    <Link
      aria-label="SkillSwap home"
      className={cn("inline-flex items-center", className)}
      href={href}
    >
      {logo}
    </Link>
  );
}
