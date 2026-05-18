import { ImageResponse } from "next/og";

export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon() {
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
          fontSize: 120,
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
