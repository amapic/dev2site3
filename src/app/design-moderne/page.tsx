import { readdirSync } from "fs";
import { join } from "path";
import Image from "next/image";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".jfif", ".avif", ".gif"]);

function getImages(folder: string): string[] {
  const dir = join(process.cwd(), "public", folder);
  const files = readdirSync(dir);
  return files
    .filter((file) => IMAGE_EXTENSIONS.has(file.slice(file.lastIndexOf(".")).toLowerCase()))
    .map((file) => `/${folder}/${encodeURIComponent(file)}`);
}

export default function DesignModernePage() {
  const imagePaths = getImages("design-moderne");

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        padding: "2px 0",
        display: "flex",
        flexDirection: "column",
        gap: "2px",
      }}
    >
      {imagePaths.map((src, index) => (
        <Image
          key={src}
          src={src}
          alt={`Design moderne ${index + 1}`}
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: "100%", height: "auto", display: "block" }}
          priority={index < 3}
        />
      ))}
    </main>
  );
}
