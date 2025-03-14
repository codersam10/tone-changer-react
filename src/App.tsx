import React from "react";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { ToastContainer, toast, Bounce } from "react-toastify";

type TransformedText =
  | null
  | {
    text: string;
  }[];

export default function App() {
  const tones = [
    "casual",
    "polite",
    "grateful",
    "sarcastic",
    "exited",
    "professional",
    "angry",
    "serious",
    "guilty",
  ];

  const [preferredTone, setPreferredTone] = React.useState(tones[0]);
  const [text, setText] = React.useState("");
  const [transformedText, setTransformedText] =
    React.useState<TransformedText>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preferredTone || !text) {
      return console.error("Please enter a tone and text");
    }

    try {
      setIsLoading(true);
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);

      const schema = {
        description: "Rephrased variations of the text",
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            text: {
              type: SchemaType.STRING,
              description: "variation of the text",
              nullable: false,
            },
          },
          required: ["text"],
        },
      };

      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction:
          "You are an expert english language professional. Generate FIVE distinct variations of the given text.",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      });

      const prompt = ` Rephrase this sentence in ${preferredTone} tone: ${text}`;

      const result = await model.generateContent(prompt);
      const response = await JSON.parse(result.response.text());
      setTransformedText(response);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error(error);
    }
  };

  const handleToneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPreferredTone(e.target.value);
    handleSubmit(e);
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.info('Text Copied!', {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: false,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: "colored",
      transition: Bounce,
    });
  }

  return (
    <div className="wrapper flex dark:bg-[hsl(0,0%,15%)] flex-col items-center md:my-2 h-screen md:h-[95vh] px-4 py-4 max-w-2xl mx-auto shadow-current shadow-md md:rounded-2xl">
      <h1 className="text-5xl font-bold">Tone Changer</h1>
      <form
        className="mt-4 w-full"
        onSubmit={handleSubmit}
      >
        <div className="flex border-2 rounded-md overflow-hidden h-24">
          <select
            className="p-2 border-r-2 h-full"
            value={preferredTone}
            onChange={handleToneChange}
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
          <textarea
            className="resize-none min-h-full p-2 w-full"
            placeholder="Enter text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
        </div>
        <button
          className={`w-full shadow-current shadow-sm rounded-md p-2 mt-3 ${isLoading ? "opacity-50" : "active:scale-98"
            }`}
          type="submit"
          disabled={isLoading}
        >
          Submit
        </button>
      </form>

      <div className={`response-container mt-5 ${(transformedText || isLoading) && "p-3"} rounded-xl w-full overflow-y-scroll`}>
        {isLoading ? (
          <p className="animate-pulse"> Loading...</p>
        ) : (
          <div className="flex flex-col gap-1">
            {transformedText &&
              transformedText.map(
                (variation: { text: string }, index: number) => (
                  <div
                    key={index}
                    className="variation flex flex-col hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md p-2"
                  >
                    <p className="flex justify-between font-bold">
                      Variation {index + 1}:
                    </p>
                    <p
                      className="cursor-pointer"
                      title="Click to copy"
                      onClick={() => {
                        copyText(variation.text);
                      }}
                    >
                      {variation.text}
                    </p>
                  </div>
                )
              )}
          </div>
        )}
      </div>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
        theme="colored"
        transition={Bounce}
      />
    </div>
  );
}
