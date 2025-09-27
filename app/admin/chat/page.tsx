
import ChatUI from "../../../components/ChatUI";

export default function AdminChatPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const promptParam = Array.isArray(searchParams?.prompt) ? searchParams?.prompt[0] : (searchParams?.prompt as string | undefined);
  // Start blank by default. We DO NOT run the server AI automatically on page load.
  // If you want to prefill the input, pass promptParam as initialPrompt; sending still requires user action.

  // Mascot image is in the public directory: /apclover.jpg
  const mascotPath = "/apclover.jpg";

  return (
    <div className="p-6">
      <ChatUI initialPrompt={promptParam || ""} mascot={mascotPath} />
    </div>
  );
}

