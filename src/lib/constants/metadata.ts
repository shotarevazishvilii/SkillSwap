import type { Metadata } from "next";

import { APP_DESCRIPTION, APP_LOGO_PATH, APP_NAME } from "@/lib/constants/app";
import { getPublicAppUrl } from "@/lib/constants/env";

export function createRootMetadata(): Metadata {
  const appUrl = getPublicAppUrl();
  const logoUrl = new URL(APP_LOGO_PATH, appUrl);

  return {
    metadataBase: new URL(appUrl),
    title: {
      default: APP_NAME,
      template: `%s | ${APP_NAME}`,
    },
    description: APP_DESCRIPTION,
    applicationName: APP_NAME,
    icons: {
      icon: APP_LOGO_PATH,
      shortcut: APP_LOGO_PATH,
      apple: APP_LOGO_PATH,
    },
    openGraph: {
      title: APP_NAME,
      description: APP_DESCRIPTION,
      images: [
        {
          alt: APP_NAME,
          height: 114,
          url: logoUrl,
          width: 376,
        },
      ],
      locale: "en_US",
      siteName: APP_NAME,
      type: "website",
      url: appUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: APP_NAME,
      description: APP_DESCRIPTION,
      images: [logoUrl],
    },
  };
}
