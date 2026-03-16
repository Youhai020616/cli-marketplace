import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CLI Marketplace — Discover CLI Tools";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "monospace",
          position: "relative",
        }}
      >
        {/* Border */}
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            right: 20,
            bottom: 20,
            border: "4px solid #e5e5e5",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Terminal prompt */}
          <div style={{ color: "#999", fontSize: 24, marginBottom: 16 }}>
            $ cli-marketplace
          </div>

          {/* Title */}
          <div style={{ color: "#7c3aed", fontSize: 64, fontWeight: "bold", marginBottom: 8 }}>
            &gt; CLI Marketplace
          </div>

          {/* Subtitle */}
          <div style={{ color: "#888", fontSize: 28, marginBottom: 32 }}>
            Discover &amp; Explore CLI Tools from GitHub
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 48, color: "#999", fontSize: 22 }}>
            <span>3,700+ tools</span>
            <span>12 categories</span>
            <span>Open Source</span>
          </div>

          {/* Bottom */}
          <div style={{ color: "#ccc", fontSize: 18, position: "absolute", bottom: 24 }}>
            cli-marketplace.vercel.app
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
