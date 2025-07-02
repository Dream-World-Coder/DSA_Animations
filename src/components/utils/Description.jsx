import { memo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const Description = memo(function Description({ dataObj }) {
  const { heading, subheading, summary, history, lang, code } = dataObj;

  return (
    <Card className="w-full bg-neutral-800 text-white border-none shadow-none">
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
          <SyntaxHighlighter
            language={lang || "python"}
            style={oneDark}
            wrapLine
          >
            {code}
          </SyntaxHighlighter>
        )}
      </CardFooter>
    </Card>
  );
});
export default Description;
