import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg,#2B9FD8 0%,#3DD6B5 60%,#7EEFC7 100%)",
          color: "white",
          fontSize: 112,
          fontWeight: 800,
          fontFamily: "system-ui, sans-serif",
          letterSpacing: -4,
        }}
      >
        L
      </div>
    ),
    { ...size }
  );
}
