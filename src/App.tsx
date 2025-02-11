import React from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const tones = [
  "casual",
  "polite",
  "professional",
  "enthusiastic",
  "sarcastic",
  "serious",
  "assertive",
];

export default function App() {
  const [preferredTone, setPreferredTone] = React.useState(tones[0]);
  const [text, setText] = React.useState("");
  const [transformedText, setTransformedText] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preferredTone && !text) {
      return console.error("Please enter a tone and text");
    }
    try {
      setIsLoading(true);
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);

      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `You are an expert english language professional. Rephrase this sentence in ${preferredTone} tone: ${text}`;

      const result = await model.generateContent(prompt);
      setIsLoading(false);
      setTransformedText(result.response.text());
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col items-center mt-10 min-h-screen px-4 max-w-2xl mx-auto">
      <h1 className="text-5xl font-bold">Tone Changer</h1>
      <form
        className="mt-4 w-full"
        onSubmit={handleSubmit}
      >
        <div className="flex border-2 rounded-md overflow-hidden ">
          <select
            className="p-2 border-3 h-full"
            value={preferredTone}
            onChange={(e) => setPreferredTone(e.target.value)}
            name="tone"
            id="tone"
            required
          >
            {tones.map((tone) => (
              <option
                value={tone}
                key={tone}
              >
                {tone.charAt(0).toUpperCase() + tone.slice(1)}
              </option>
            ))}
          </select>
          <input
            className="p-2 w-full"
            placeholder="Enter text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            type="text"
            required
          />
        </div>
        <button
          className="w-full border rounded-md active:scale-98 p-2 mt-3"
          type="submit"
        >
          Submit
        </button>
      </form>
      <div className="pt-4">
        {transformedText && (
          <button
            className="border px-2 py-1 rounded-sm"
            onClick={() => navigator.clipboard.writeText(transformedText)}
          >
            Copy Text
          </button>
        )}
        {isLoading ? (
          <p className="animate-pulse">Loading...</p>
        ) : (
          <p className="w-full">{transformedText}</p>
        )}
      </div>
    </div>
  );
}
