import ReactMarkdown from "react-markdown";

export default function Prose({ content }: { content: string }) {
  return (
    <div className="prose-zynli text-[14.5px] leading-relaxed text-ink">
      <ReactMarkdown
        components={{
          h1: (props) => <h3 className="mt-6 mb-2 text-[15px] font-semibold first:mt-0" {...props} />,
          h2: (props) => <h3 className="mt-6 mb-2 text-[15px] font-semibold first:mt-0" {...props} />,
          h3: (props) => <h3 className="mt-6 mb-2 text-[15px] font-semibold first:mt-0" {...props} />,
          p: (props) => <p className="mb-3" {...props} />,
          ul: (props) => <ul className="mb-3 ml-4 list-disc space-y-1" {...props} />,
          ol: (props) => <ol className="mb-3 ml-4 list-decimal space-y-1" {...props} />,
          strong: (props) => <strong className="font-semibold text-ink" {...props} />,
          code: (props) => (
            <code className="rounded bg-surface px-1 py-0.5 font-mono text-[13px] ring-1 ring-line" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
