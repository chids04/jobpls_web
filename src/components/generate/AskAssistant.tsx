import { useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon, Loader2Icon, SendIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { buildQuestionPrompt, QAMessage, sendQuestion } from "@/lib/prompts";
import { useTemplateStore } from "@/store/useStore";
import { cn } from "@/lib/utils";

type AskAssistantProps = {
  open: boolean;
  onClose: () => void;
  jobDesc: string;
  docs: string | null;
  apiKey: string;
};

export function AskAssistant({
  open,
  onClose,
  jobDesc,
  docs,
  apiKey,
}: AskAssistantProps) {
  const { useDocsForQA, setUseDocsForQA } = useTemplateStore();

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<QAMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    const q = question.trim();
    if (!q || isLoading || !apiKey) return;

    const userMsg: QAMessage = { role: "user", text: q };
    const history = [...messages, userMsg];
    setMessages(history);
    setQuestion("");
    setIsLoading(true);

    try {
      const [prompt, systemInstruction] = buildQuestionPrompt(
        jobDesc,
        docs,
        history,
        q,
      );
      const response = await sendQuestion(apiKey, prompt, systemInstruction);
      const text =
        response.text ||
        response.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, the model returned no answer.";
      setMessages((prev) => [...prev, { role: "assistant", text }]);
    } catch (error) {
      if (import.meta.env.DEV) console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Failed to get an answer, please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyText = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch (error) {
      if (import.meta.env.DEV) console.error(error);
    }
  };

  const canSend = question.trim().length > 0 && !isLoading && !!apiKey;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className="flex max-h-[85vh] flex-col gap-4 overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>ask the assistant</DialogTitle>
          <DialogDescription>
            quick answers to job application and interview questions
          </DialogDescription>
        </DialogHeader>

        {messages.length > 0 && (
          <div className="flex justify-start">
            <button
              type="button"
              onClick={() => setMessages([])}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
            >
              <Trash2Icon className="size-3.5" />
              clear chat
            </button>
          </div>
        )}

        <div
          ref={listRef}
          className="flex min-h-32 max-h-60 flex-col gap-3 overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-950/40 p-3"
        >
          {messages.length === 0 && !isLoading && (
            <p className="text-sm text-zinc-500">
              ask anything about the job description or the application...
            </p>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "flex max-w-[85%] flex-col",
                m.role === "user" ? "self-end items-end" : "self-start items-start",
              )}
            >
              <div
                className={cn(
                  "whitespace-pre-wrap break-words rounded-lg px-3 py-2 text-sm",
                  m.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-800 text-zinc-100",
                )}
              >
                {m.text}
              </div>
              {m.role === "assistant" && (
                <button
                  type="button"
                  onClick={() => copyText(m.text, i)}
                  aria-label="copy answer"
                  title="copy answer"
                  className="mt-1 text-zinc-500 transition-colors hover:text-zinc-300"
                >
                  {copiedIndex === i ? (
                    <CheckIcon className="size-3.5 text-green-500" />
                  ) : (
                    <CopyIcon className="size-3.5" />
                  )}
                </button>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 self-start rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-300">
              <Loader2Icon className="size-4 animate-spin" />
              thinking...
            </div>
          )}
        </div>

        {docs && (
          <label className="flex items-start gap-2 text-sm text-zinc-300">
            <Checkbox
              checked={useDocsForQA}
              onCheckedChange={(checked) => setUseDocsForQA(checked === true)}
              className="mt-0.5"
            />
            <span className="min-w-0 break-words">
              use generated documents to aid LLM response
            </span>
          </label>
        )}

        {!apiKey && (
          <p className="text-sm text-red-400">
            add your Gemini API key to use the assistant
          </p>
        )}

        <div className="flex items-end gap-2">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="type your question..."
            className="min-h-20 flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!canSend}
            className="shrink-0 hover:text-black"
            aria-label="send question"
          >
            <SendIcon />
            <span className="hidden sm:inline">send</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AskAssistant;
