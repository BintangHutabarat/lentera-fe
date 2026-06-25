import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = ["p", "br", "strong", "em", "u", "h2", "h3", "ul", "ol", "li", "a"];
const ALLOWED_ATTR = ["href", "target", "rel"];

/** Render HTML materi yang sudah disanitasi. JANGAN render HTML mentah tanpa ini. */
export function RichContent({ html }: { html: string }) {
  const clean = DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
  return (
    <div
      className="rich-content text-[13px] text-ink leading-relaxed"
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
