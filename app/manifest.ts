import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WebBacillus Portfolio",
    short_name: "WebBacillus",
    description: "",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#6b46c1",
    icons: [
      {
        src: "/images/logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/images/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/images/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
