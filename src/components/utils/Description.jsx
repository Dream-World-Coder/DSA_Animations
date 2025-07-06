import { useState, memo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Copy } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const Description = memo(function Description({ dataObj }) {
  const { heading, subheading, summary, history, lang, code } = dataObj;
  const [copied, setCopied] = useState(false);

  return (
    <Card className="w-full bg-neutral-800 text-white border-none shadow-none rounded-lg">
      <CardHeader>
        {heading && <CardTitle>{heading}</CardTitle>}
        {subheading && (
          <CardDescription className="text-neutral-400">
            {subheading}
          </CardDescription>
        )}
      </CardHeader>

      {summary && (
        <CardContent
          dangerouslySetInnerHTML={{ __html: summary }}
        ></CardContent>
      )}

      <CardFooter className="flex flex-col items-start">
        {history && <p className="text-neutral-400 text-sm">{history}</p>}
        {code && (
          <div className="relative w-full overflow-auto text-sm sm:text-base rounded-md">
            {/* Copy button */}
            <button
              className="absolute top-2 right-2 bg-neutral-700 hover:bg-neutral-600 text-white p-1.5 rounded-md text-xs flex items-center gap-1"
              onClick={() => {
                navigator.clipboard.writeText(code);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              <Copy size={14} />
              {copied ? "Copied!" : "Copy"}
            </button>

            {/* Code block */}
            <SyntaxHighlighter
              language={lang || "python"}
              style={oneDark}
              wrapLines
              wrapLongLines
              customStyle={{ margin: 0, padding: "1rem", minWidth: "100%" }}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        )}
      </CardFooter>
    </Card>
  );
});
export default Description;
